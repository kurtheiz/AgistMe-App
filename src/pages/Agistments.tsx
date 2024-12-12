import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import AgistmentList from '../components/AgistmentList';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { BookmarkPlus, ListFilter } from 'lucide-react';
import { SearchRequest, SearchResponse } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { scrollManager } from '../utils/scrollManager';
import { agistmentService } from '../services/agistment.service';
import { profileService } from '../services/profile.service';
import { advertService, Advert } from '../services/advert.service';
import { useSearchStore } from '../stores/search.store';
import { decodeSearchHash } from '../utils/searchHashUtils';
import { Dropdown } from '../components/shared/Dropdown';
import { SearchCriteriaDisplay } from '../components/shared/SearchCriteriaDisplay';

const Agistments = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const { isSearchModalOpen, setIsSearchModalOpen } = useSearchStore();
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<SearchRequest | null>(null);
  const [forceResetSearch, setForceResetSearch] = useState(false);
  const [searchTitle, setSearchTitle] = useState('Search Properties');
  const [shouldRefreshSavedSearches, setShouldRefreshSavedSearches] = useState(false);
  const searchHash = searchParams.get('q') || '';

  const loadMore = async () => {
    if (!searchResponse?.nextToken) return;
    setIsFetching(true);
    try {
      const response = await agistmentService.searchAgistments(searchHash, searchResponse.nextToken);
      if (response) {
        setSearchResponse({
          ...response,
          results: [...(searchResponse?.results || []), ...response.results]
        });
      }
    } catch (error) {
      console.error('Load more error:', error);
      toast.error('Failed to load more results. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const searchHash = searchParams.get('q');
    if (searchHash) {
      const decodedCriteria = decodeSearchHash(searchHash);
      setCurrentCriteria(decodedCriteria);
      const fetchData = async () => {
        setIsFetching(true);
        try {
          const searchResult = await agistmentService.searchAgistments(searchHash);
          if (searchResult) {
            setSearchResponse(searchResult);
            if (searchResult.results.length > 0) {
              // Only fetch adverts if we have search results
              const advertsData = await advertService.getAdverts();
              setAdverts(advertsData);
            } else {
              setAdverts([]);
            }
          }
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Failed to perform search. Please try again.');
        } finally {
          setIsFetching(false);
        }
      };
      fetchData();
    } else {
      setSearchResponse(null);
      setAdverts([]); // Clear adverts when there's no search
    }
  }, [searchParams, forceResetSearch]);

  useEffect(() => {
    if (searchParams.get('openSearch') === 'true') {
      setIsSearchModalOpen(true);
      // Remove the openSearch parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openSearch');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, setIsSearchModalOpen]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      setForceResetSearch(false);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      setSearchTitle('Search Properties');
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (location.key && !isFetching) {
        scrollManager.savePosition(location.key);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key, isFetching]);

  useEffect(() => {
    const restoreScroll = () => {
      if (!isFetching && location.key) {
        const savedPosition = scrollManager.getPosition(location.key);
        if (savedPosition !== undefined) {
          setTimeout(() => {
            window.scrollTo(0, savedPosition);
          }, 0);
        } else {
          window.scrollTo(0, 0);
        }
      }
    };
    restoreScroll();
  }, [location.key, isFetching]);

  useEffect(() => {
    if (searchHash) {
      setSearchParams({ q: searchHash });
    }
  }, [searchHash]);

  const handleSearch = async (criteria: SearchRequest & { searchHash: string }) => {
    setIsSearchModalOpen(false);
    setIsFetching(true);
    try {
      const response = await agistmentService.searchAgistments(criteria.searchHash);
      setSearchResponse(response);
      setSearchParams({ q: criteria.searchHash });
      setForceResetSearch(false);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const hasMore = searchResponse?.nextToken !== null && searchResponse?.nextToken !== undefined;

  return (
    <>

      <PageToolbar>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.error('Please sign in to save searches');
                } else {
                  setIsSaveSearchModalOpen(true);
                }
              }}
              disabled={!searchHash}
              className={`inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${!searchHash ? 'text-gray-400 ring-gray-200 cursor-not-allowed' : 'text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
            >
              <BookmarkPlus className="h-4 w-4" />
              <span>Save Search</span>
            </button>
          </div>

          {currentCriteria && (
            <Dropdown
              align="right"
              width="w-80"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset text-gray-900 ring-gray-300 hover:bg-gray-50"
                >
                  <ListFilter className="h-4 w-4" />
                  <span>View Criteria</span>
                </button>
              }
              content={
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Search Criteria</h3>
                  <SearchCriteriaDisplay searchCriteria={currentCriteria} />
                </div>
              }
            />
          )}
        </div>
      </PageToolbar>

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="pb-8 pt-4 md:px-4 text-gray-500">
            {searchResponse && searchResponse.results.length > 0 ? (
              <AgistmentList 
                agistments={searchResponse.results} 
                adverts={adverts}
                onLoadMore={loadMore}
                hasMore={!!searchResponse.nextToken}
                isLoading={isFetching}
                title={searchTitle}
                searchCriteria={currentCriteria}
              />
            ) : (
              <div className="flex flex-col items-center py-3 md:py-16 px-4">
                <div className="mb-4 md:mb-8 text-neutral-400">
                  <AnimatedSearchLogo className="w-12 h-12 md:w-48 md:h-48" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 text-neutral-800 dark:text-neutral-200">No Properties Found</h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-4 md:mb-8 max-w-md text-left leading-relaxed">
                  We couldn't find any properties matching your criteria. Try adjusting your search parameters.
                </p>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="button-primary"
                >
                  Modify Search
                </button>
              </div>
            )}
            {!searchHash && (
              <div className="flex flex-col items-center py-3 md:py-16 px-4">
                <div className="mb-3 md:mb-8 text-neutral-400">
                  <AnimatedSearchLogo className="w-2 h-2 md:w-48 md:h-48" />
                </div>
                <h2 className="text-lg md:text-3xl font-semibold mb-2 md:mb-4 text-neutral-800 dark:text-neutral-200">
                  Find your perfect Agistment
                </h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-3 md:mb-8 max-w-lg text-left leading-relaxed">
                  Your perfect agistment journey starts here. Search by location, facilities, and care options to find the ideal home for your horse.
                </p>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="button-primary"
                >
                  Start Searching
                </button>
              </div>
            )}
          </div>
        )}
        {hasMore && !isFetching && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              className="button-secondary"
            >
              Load More Results
            </button>
          </div>
        )}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleSearch}
          initialSearchHash={searchHash}
          forceReset={forceResetSearch}
          title={searchTitle}
          refreshSavedSearches={shouldRefreshSavedSearches}
        />
        {isSaveSearchModalOpen && (
          <SaveSearchModal
            isOpen={isSaveSearchModalOpen}
            onClose={() => setIsSaveSearchModalOpen(false)}
            searchCriteria={currentCriteria}
            onSave={async (name, enableNotifications) => {
              if (!user || !searchHash) return;
              const newSavedSearch = {
                id: crypto.randomUUID(),
                name: name,
                searchHash,
                lastUpdate: new Date().toISOString(),
                enableNotifications
              };
              try {
                const response = await profileService.getSavedSearches();
                const updatedSearches = [...response.savedSearches, newSavedSearch];
                await profileService.updateSavedSearches(updatedSearches);
                setIsSaveSearchModalOpen(false);
                setShouldRefreshSavedSearches(true);
                toast.success('Search saved successfully');
              } catch (error) {
                console.error('Failed to save search:', error);
                toast.error('Failed to save search');
              }
            }}
          />
        )}
      </div>
    </>
  );
};

export default Agistments;
