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
            {searchHash && (
              <button
                onClick={handleSaveSearch}
                className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Save Search</span>
              </button>
            )}
          </div>
        }
      />

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <AnimatedSearchLogo className="w-12 h-12" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-gray-500">
              Failed to load agistments. Please try again later.
            </div>
          ) : agistments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No agistments found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="pb-8 pt-4 md:px-4">
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
