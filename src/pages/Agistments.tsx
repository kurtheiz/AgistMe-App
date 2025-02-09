import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { RotateCw } from 'lucide-react';
import { SearchRequest } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { useSearchStore } from '../stores/search.store';
import { decodeSearchHash } from '../utils/searchHashUtils';
import { useAgistmentSearch, SortOption } from '../hooks/useAgistmentSearch';
import { useSavedSearchesStore } from '../stores/savedSearches.store';
import { useQueryClient } from '@tanstack/react-query';
import { PropertyCard } from '../components/PropertyCard';
import { Menu } from '@headlessui/react';
import { MapPin, ArrowDownNarrowWide, ArrowUpNarrowWide, ChevronDown } from 'lucide-react';

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

  const [sortOption, setSortOption] = useState<SortOption>('default');

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['agistments', searchHash]
    });
  }, [queryClient, searchHash]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    refetch
  } = useAgistmentSearch(searchHash, sortOption);

  const agistments = data?.pages.flatMap(page => page.results) ?? [];

  const getLocationDisplayText = (criteria: SearchRequest | null) => {
    if (!criteria?.suburbs?.[0]) return '';
    
    const firstLocation = criteria.suburbs[0];
    let locationText = '';

    if (firstLocation.locationType === 'STATE') {
      locationText = firstLocation.state;
    } else if (firstLocation.locationType === 'REGION') {
      locationText = `${firstLocation.region}, ${firstLocation.state}`;
    } else if (firstLocation.locationType === 'SUBURB') {
      locationText = `${firstLocation.suburb}, ${firstLocation.state}`;
    }

    if (criteria.radius && criteria.radius > 0) {
      locationText += ` (${criteria.radius}km radius)`;
    }

    if (criteria.suburbs.length > 1) {
      locationText += ' and other locations';
    }

    return locationText;
  };

  const getActiveFiltersCount = (criteria: SearchRequest | null) => {
    if (!criteria) return 0;
    let count = 0;
    
    if (criteria.paddockTypes.length > 0) count++;
    if (criteria.spaces > 0) count++;
    if (criteria.maxPrice > 0) count++;
    if (criteria.hasArena) count++;
    if (criteria.hasRoundYard) count++;
    if (criteria.facilities.length > 0) count++;
    if (criteria.careTypes.length > 0) count++;
    
    return count;
  };

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

  const getLocationTextForSave = (criteria: SearchRequest | null) => {
    if (!criteria) return '';
    const locationText = criteria.suburbs.map(s => s.suburb).join(', ');
    return locationText;
  };

  const handleSaveSearch = () => {
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
            <div className="flex items-center gap-2">
              <Menu as="div" className="relative">
                <Menu.Button 
                  className={`button-toolbar ${(!searchHash || agistments.length === 0) && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
                  disabled={!searchHash || agistments.length === 0}
                >
                  {sortOption === 'default' && <MapPin className="w-4 h-4" />}
                  {sortOption === 'low-to-high' && <ArrowUpNarrowWide className="w-4 h-4" />}
                  {sortOption === 'high-to-low' && <ArrowDownNarrowWide className="w-4 h-4" />}
                  <span>Sort</span>
                  <ChevronDown className="w-4 h-4" />
                </Menu.Button>
                <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSortOption('default');
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            sortOption === 'default' ? 'text-primary-600' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          Distance
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSortOption('low-to-high');
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            sortOption === 'low-to-high' ? 'text-primary-600' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          Price: Low to High
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setSortOption('high-to-low');
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            sortOption === 'high-to-low' ? 'text-primary-600' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          Price: High to Low
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
              <button
                onClick={handleSaveSearch}
                disabled={!searchHash}
                className={`button-toolbar ${!searchHash && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
              >
                <span>Save Search</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                disabled={!searchHash || isFetching}
                className={`button-toolbar ${(!searchHash || isFetching) && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
              >
                <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
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
                {(() => {
                  const locationText = getLocationDisplayText(currentCriteria);
                  const filterCount = getActiveFiltersCount(currentCriteria);
                  const filterText = filterCount > 0 ? ` with ${filterCount} filter${filterCount === 1 ? '' : 's'} set` : '';
                  
                  if (hasNextPage) {
                    return `Showing first ${agistments.length} agistments found${locationText ? ` in ${locationText}` : ''}${filterText}`;
                  } else {
                    return `${agistments.length} agistment${agistments.length === 1 ? '' : 's'} found${locationText ? ` in ${locationText}` : ''}${filterText}`;
                  }
                })()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 px-0 md:px-0">
                {agistments.map((agistment) => (
                  <PropertyCard 
                    key={agistment.id}
                    agistment={agistment}
                    searchCriteria={{ paddockTypes: currentCriteria?.paddockTypes }}
                  />
                ))}
              </div>
              {hasNextPage && !isFetching && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => fetchNextPage()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
              {isFetching && (
                <div className="text-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              )}
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
        initialName={getLocationTextForSave(currentCriteria)}
        initialIsDirty={true}
      />
    </>
  );
};

export default Agistments;
