import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import AgistmentList from '../components/AgistmentList';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { BookmarkPlus } from 'lucide-react';
import { SearchRequest } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { useSearchStore } from '../stores/search.store';
import { decodeSearchHash } from '../utils/searchHashUtils';
import { useAgistmentSearch } from '../hooks/useAgistmentSearch';

const Agistments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen,
    scrollPosition,
    setScrollPosition
  } = useSearchStore();
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<SearchRequest | null>(null);
  const [forceResetSearch, setForceResetSearch] = useState(false);
  const [shouldRefreshSavedSearches, setShouldRefreshSavedSearches] = useState(false);
  const searchHash = searchParams.get('q') || '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
  } = useAgistmentSearch(searchHash);

  const agistments = data?.pages.flatMap(page => page.results) ?? [];

  // Save scroll position when unmounting
  useEffect(() => {
    return () => {
      setScrollPosition(window.scrollY);
    };
  }, [setScrollPosition]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (!isLoading && !isFetching && agistments.length > 0 && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [isLoading, isFetching, agistments.length, scrollPosition]);

  // Only scroll to top on new searches
  useEffect(() => {
    if (searchHash) {
      try {
        const criteria = decodeSearchHash(searchHash);
        setCurrentCriteria(criteria);
        // Only scroll to top if this is a new search, not when returning to the page
        if (!data) {
          window.scrollTo(0, 0);
        }
      } catch (error) {
        console.error('Failed to decode search hash:', error);
        toast.error('Failed to decode search parameters');
      }
    }
  }, [searchHash, data]);

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('Please sign in to save searches');
      return;
    }
    setIsSaveSearchModalOpen(true);
  };

  const handleSaveSearchComplete = () => {
    setIsSaveSearchModalOpen(false);
    setShouldRefreshSavedSearches(true);
    toast.success('Search saved successfully');
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setForceResetSearch(false);
  };

  return (
    <>
      <PageToolbar
        actions={
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveSearch}
              disabled={!searchHash}
              className={`button-toolbar ${!searchHash && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Search</span>
            </button>
          </div>
        }
      />

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-32 h-32 md:w-48 md:h-48">
                <AnimatedSearchLogo className="w-full h-full" />
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-gray-500">
              Failed to load agistments. Please try again later.
            </div>
          ) : agistments.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-6">
                <div className="w-32 h-32 md:w-48 md:h-48 mx-auto">
                  <AnimatedSearchLogo className="w-full h-full" />
                </div>
                <div className="text-gray-500">
                  {!searchHash ? (
                    <>
                      <p>Start by searching for agistments in your area.</p>
                      <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Start Searching
                      </button>
                    </>
                  ) : (
                    <>
                      <p>No agistments found with your current search criteria.</p>
                      <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Modify Search
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-8 pt-4 md:px-4">
              <div className="mb-4 text-sm text-neutral-600">
                {agistments.length} {agistments.length === 1 ? 'agistment' : 'agistments'} found
              </div>
              <AgistmentList 
                agistments={agistments}
                hasMore={hasNextPage}
                isLoading={isFetching}
                onLoadMore={() => fetchNextPage()}
              />
            </div>
          )}
        </div>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        initialCriteria={currentCriteria}
        forceReset={forceResetSearch}
      />

      <SaveSearchModal
        isOpen={isSaveSearchModalOpen}
        onClose={() => setIsSaveSearchModalOpen(false)}
        onSave={handleSaveSearchComplete}
        searchHash={searchHash}
        searchCriteria={currentCriteria}
      />
    </>
  );
};

export default Agistments;
