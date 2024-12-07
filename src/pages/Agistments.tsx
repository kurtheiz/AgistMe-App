import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import AgistmentList from '../components/AgistmentList';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { Search, BookmarkPlus } from 'lucide-react';
import { SearchRequest, SearchResponse } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { scrollManager } from '../utils/scrollManager';
import { agistmentService } from '../services/agistment.service';
import { profileService } from '../services/profile.service';
import { advertService, Advert } from '../services/advert.service';
import { useSearchStore } from '../stores/search.store';

const decodeSearchHash = (hash: string): SearchRequest => {
  try {
    const decodedSearch = JSON.parse(atob(hash));
    if (decodedSearch.s && Array.isArray(decodedSearch.s)) {
      return {
        suburbs: decodedSearch.s.map((s: any) => ({
          id: s.i?.replace(/['"]/g, ''),
          suburb: s.n,
          postcode: s.p,
          state: s.t,
          region: s.r,
          geohash: s.g,
          locationType: s.l
        })),
        radius: decodedSearch.r || 0,
        paddockTypes: decodedSearch.pt || [],
        spaces: decodedSearch.sp || 0,
        maxPrice: decodedSearch.mp || 0,
        hasArena: decodedSearch.a || false,
        hasRoundYard: decodedSearch.ry || false,
        facilities: decodedSearch.f || [],
        careTypes: decodedSearch.ct || []
      };
    }
    return decodedSearch;
  } catch (error) {
    console.error('Error decoding search hash:', error);
    return {
      suburbs: [],
      radius: 0,
      paddockTypes: [],
      spaces: 0,
      maxPrice: 0,
      hasArena: false,
      hasRoundYard: false,
      facilities: [],
      careTypes: []
    };
  }
};

export function Agistments() {
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

  const fetchAdverts = async () => {
    try {
      const advertsData = await advertService.getAdverts();
      setAdverts(advertsData);
    } catch (error) {
      console.error('Error fetching adverts:', error);
    }
  };

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
          const [searchResult, advertsData] = await Promise.all([
            agistmentService.searchAgistments(searchHash),
            advertService.getAdverts()
          ]);
          if (searchResult) {
            setSearchResponse(searchResult);
          }
          setAdverts(advertsData);
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
      fetchAdverts();
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

  const getLocationTitle = (suburbs: any[]) => {
    if (!suburbs || suburbs.length === 0) return '';
    if (suburbs.length === 1) {
      const loc = suburbs[0];
      if ('n' in loc && 'p' in loc && 't' in loc) {
        if (loc.i.split('#').length === 2) {
          return loc.n;
        }
        if (loc.n && loc.p) return `${loc.n}, ${loc.p}, ${loc.t}`;
        if (loc.r) return `${loc.r}, ${loc.t}`;
        return loc.t;
      }
      if (loc.id.split('#').length === 2) {
        return loc.suburb;
      }
      if (loc.suburb && loc.postcode) return `${loc.suburb}, ${loc.postcode}, ${loc.state}`;
      if (loc.region) return `${loc.region}, ${loc.state}`;
      return loc.state;
    }
    const firstLoc = suburbs[0];
    if ('n' in firstLoc && 'p' in firstLoc && 't' in firstLoc) {
      return `${firstLoc.n}, ${firstLoc.p}, ${firstLoc.t} and other locations`;
    }
    return `${firstLoc.suburb}, ${firstLoc.postcode}, ${firstLoc.state} and other locations`;
  };

  const hasMore = searchResponse?.nextToken !== null && searchResponse?.nextToken !== undefined;

  return (
    <>

      <PageToolbar>
        <div className="flex items-center gap-2 w-full">
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
      </PageToolbar>

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="pb-8 pt-4 md:px-4 text-gray-500">
            {searchResponse && (
              <>

                {/* Exact Matches Section */}
                {searchResponse.results.some(item => item.matchType === 'EXACT') && (
                  <div className="text-left">
                    <AgistmentList
                      agistments={searchResponse.results.filter(item => item.matchType === 'EXACT')}
                      adverts={adverts}
                      hasMore={hasMore}
                      onLoadMore={loadMore}
                      isLoading={isFetching}
                      matchType="EXACT"
                      title={currentCriteria ? `${searchResponse.results.filter(item => item.matchType === 'EXACT').length} Agistment${searchResponse.results.filter(item => item.matchType === 'EXACT').length === 1 ? '' : 's'} in ${getLocationTitle(currentCriteria.suburbs)}` : ''}
                    />
                  </div>
                )}

                {/* Properties Nearby Section */}
                {searchResponse.results.some(item => item.matchType === 'ADJACENT') && (
                  <>

                    {searchResponse.results.some(item => item.matchType === 'EXACT') && (
                      <div className="my-8 border-t border-neutral-200" />
                    )}

                    <div className="text-left">
                      <AgistmentList
                        agistments={searchResponse.results.filter(item => item.matchType === 'ADJACENT')}
                        adverts={adverts}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        isLoading={isFetching}
                        matchType="ADJACENT"
                        title={currentCriteria ? `${searchResponse.results.filter(item => item.matchType === 'ADJACENT').length} Agistment${searchResponse.results.filter(item => item.matchType === 'ADJACENT').length === 1 ? '' : 's'} within ${currentCriteria.radius}km` : ''}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            {(!searchResponse || searchResponse.results.length === 0) && searchHash && (
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
}
