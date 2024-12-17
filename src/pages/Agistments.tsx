import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import AgistmentList from '../components/AgistmentList';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { BookmarkPlus, RotateCw } from 'lucide-react';
import { SearchRequest } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { useSearchStore } from '../stores/search.store';
import { decodeSearchHash } from '../utils/searchHashUtils';
import { useAgistmentSearch } from '../hooks/useAgistmentSearch';
import { useSavedSearchesStore } from '../stores/savedSearches.store';
import { useQueryClient } from '@tanstack/react-query';

const Agistments = () => {
  const [searchParams] = useSearchParams();
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
  const searchHash = searchParams.get('q') || '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    refetch
  } = useAgistmentSearch(searchHash);

  const agistments = data?.pages.flatMap(page => page.results) ?? [];

  const queryClient = useQueryClient();

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

  const handleSaveSearchComplete = async (name: string, enableNotifications: boolean) => {
    try {
      if (!currentCriteria) return;
      
      await useSavedSearchesStore.getState().saveSearch(
        name,
        currentCriteria,
        enableNotifications,
        undefined,
        queryClient
      );
      setIsSaveSearchModalOpen(false);

    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setForceResetSearch(false);
  };

  return (
    <>
      <PageToolbar
        actions={
          <div className="flex justify-between w-full">
            <button
              onClick={handleSaveSearch}
              disabled={!searchHash}
              className={`button-toolbar ${!searchHash && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Search</span>
            </button>
            <button
              onClick={() => refetch()}
              disabled={!searchHash || isFetching}
              className={`button-toolbar ${(!searchHash || isFetching) && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="w-32 h-32 md:w-48 md:h-48">
                <AnimatedSearchLogo className="w-full h-full" />
              </div>
              <div className="w-full max-w-xl px-4">
                <p className="text-center text-sm text-gray-500 mt-2">Searching for agistments...</p>
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
              <div className="mb-4 text-sm text-neutral-600 px-4">
                {agistments.length} {agistments.length === 1 ? 'agistment' : 'agistments'} found
              </div>
              <AgistmentList 
                agistments={agistments}
                hasMore={hasNextPage}
                isLoading={isFetching}
                onLoadMore={() => fetchNextPage()}
                searchCriteria={{ paddockTypes: currentCriteria?.paddockTypes }}
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
        onSearch={(criteria) => {
          setCurrentCriteria(criteria);
          setForceResetSearch(false);
        }}
      />

      <SaveSearchModal
        isOpen={isSaveSearchModalOpen}
        onClose={() => setIsSaveSearchModalOpen(false)}
        onSave={handleSaveSearchComplete}
        searchCriteria={currentCriteria}
      />
    </>
  );
};

export default Agistments;
