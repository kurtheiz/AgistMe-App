import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { AgistmentList } from '../components/AgistmentList';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { SearchModal } from '../components/Search/SearchModal';
import { PageToolbar } from '../components/PageToolbar';
import { Search, Star, ChevronDown, BookmarkPlus } from 'lucide-react';
import { SearchRequest, SearchResponse } from '../types/search';
import { AnimatedSearchLogo } from '../components/Icons/AnimatedSearchLogo';
import toast from 'react-hot-toast';
import { scrollManager } from '../utils/scrollManager';
import { agistmentService } from '../services/agistment.service';

const decodeSearchHash = (hash: string): SearchRequest => {
  try {
    const decodedSearch = JSON.parse(atob(hash));
    
    // Convert old format to new format if necessary
    if (decodedSearch.s && Array.isArray(decodedSearch.s)) {
      return {
        suburbs: decodedSearch.s.map((s: any) => ({
          id: s.i,
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
  const { profile, updateProfileData, loading: profileLoading } = useProfile();
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(() => searchParams.get('openSearch') === 'true');
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<SearchRequest | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedSearchHash, setSelectedSearchHash] = useState('');
  const [forceResetSearch, setForceResetSearch] = useState(false);
  const [searchTitle, setSearchTitle] = useState('Search Properties');
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      console.log('Decoded search criteria:', decodedCriteria); // Debug log
      setCurrentCriteria(decodedCriteria);
      setIsFetching(true);

      // Remove any trailing slashes from the search hash
      const cleanSearchHash = searchHash.replace(/\/$/, '');

      agistmentService.searchAgistments(cleanSearchHash)
        .then(response => {
          if (response) {
            setSearchResponse(response);
          } else {
            console.error('Invalid response format:', response);
            setSearchResponse(null);
          }
        })
        .catch(error => {
          console.error('Error fetching agistments:', error);
          setSearchResponse(null);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      // No search hash, clear results
      setSearchResponse(null);
      setCurrentCriteria(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('openSearch') === 'true') {
      setIsSearchModalOpen(true);
      // Remove the openSearch parameter to prevent reopening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openSearch');
      setSearchParams(newParams.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // Only save position if we're not in a loading state
      if (location.key && !isFetching) {
        scrollManager.savePosition(location.key);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key, isFetching]);

  useEffect(() => {
    // Function to handle scroll restoration
    const restoreScroll = () => {
      if (!isFetching && location.key) {
        const savedPosition = scrollManager.getPosition(location.key);
        if (savedPosition !== undefined) {
          // Use setTimeout to ensure DOM is fully rendered
          setTimeout(() => {
            window.scrollTo(0, savedPosition);
          }, 0);
        } else {
          // Fresh navigation - scroll to top
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

  const handleFavorites = () => {
    setSearchParams({ favourites: 'true' });
  };

  const handleSavedSearchSelect = (searchHash: string, name: string) => {
    console.log('handleSavedSearchSelect called', { searchHash, name });
    setIsSearchDropdownOpen(false);
    setSelectedSearchHash(searchHash);
    setSearchTitle(name);
    setTimeout(() => {
      setIsSearchModalOpen(true);
    }, 0);
  };

  const getLocationTitle = (suburbs: any[]) => {
    if (!suburbs || suburbs.length === 0) return '';
    
    if (suburbs.length === 1) {
      const loc = suburbs[0];
      // Handle old format (s array with i, n, p, t, r properties)
      if ('n' in loc && 'p' in loc && 't' in loc) {
        // If it's a state-only search
        if (loc.i.split('#').length === 2) {
          return loc.n;
        }
        // If suburb is provided, show suburb, postcode, state
        if (loc.n && loc.p) return `${loc.n}, ${loc.p}, ${loc.t}`;
        // If region is provided, show region, state
        if (loc.r) return `${loc.r}, ${loc.t}`;
        // If only state, show state
        return loc.t;
      }
      
      // Handle new format (suburbs array with suburb, postcode, state properties)
      // If it's a state-only search
      if (loc.id.split('#').length === 2) {
        return loc.suburb;
      }
      // If suburb is provided, show suburb, postcode, state
      if (loc.suburb && loc.postcode) return `${loc.suburb}, ${loc.postcode}, ${loc.state}`;
      // If region is provided, show region, state
      if (loc.region) return `${loc.region}, ${loc.state}`;
      // If only state, show state
      return loc.state;
    }

    // Multiple locations - show first location and indicate others
    const firstLoc = suburbs[0];
    // Handle old format
    if ('n' in firstLoc && 'p' in firstLoc && 't' in firstLoc) {
      return `${firstLoc.n}, ${firstLoc.p}, ${firstLoc.t} and other locations`;
    }
    // Handle new format
    return `${firstLoc.suburb}, ${firstLoc.postcode}, ${firstLoc.state} and other locations`;
  };

  const { totalCount = 0 } = searchResponse || {};
  const hasMore = searchResponse?.nextToken !== null && searchResponse?.nextToken !== undefined;

  return (
    <>
      <PageToolbar
        actions={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => (profile?.savedSearches?.length ?? 0)
                    ? setIsSearchDropdownOpen(!isSearchDropdownOpen)
                    : setIsSearchModalOpen(true)
                  }
                  className="button-toolbar inline-flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden md:inline">Search</span>
                  {(profile?.savedSearches?.length ?? 0) > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isSearchDropdownOpen && (profile?.savedSearches?.length ?? 0) > 0 && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsSearchDropdownOpen(false);
                        setIsSearchModalOpen(true);
                        setSelectedSearchHash(searchHash || '');
                        setForceResetSearch(!searchHash);
                        setSearchTitle('Search');
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsSearchDropdownOpen(false);
                        setIsSearchModalOpen(true);
                        setSelectedSearchHash(searchHash || '');
                        setForceResetSearch(!searchHash);
                        setSearchTitle('Search');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200"
                    >
                      Search
                    </button>
                    <div className="h-px bg-neutral-200 my-1" />
                    {profile?.savedSearches?.map((search) => (
                      <button
                        key={search.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSavedSearchSelect(search.searchHash, search.name);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSavedSearchSelect(search.searchHash, search.name);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200"
                      >
                        {search.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!profileLoading && profile && (
                <button
                  onClick={handleFavorites}
                  className="button-toolbar inline-flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  <span className="hidden md:inline">Favorites</span>
                </button>
              )}
            </div>
            {profile && searchHash && (
              <button
                onClick={() => setIsSaveSearchModalOpen(true)}
                className="button-toolbar inline-flex items-center gap-2 ml-2"
              >
                <BookmarkPlus className="w-5 h-5" />
                <span className="hidden md:inline">Save this search</span>
              </button>
            )}
          </div>
        }
      />
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
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        isLoading={isFetching}
                        matchType="ADJACENT"
                        title={currentCriteria ? `${searchResponse.results.filter(item => item.matchType === 'ADJACENT').length} Agistment${searchResponse.results.filter(item => item.matchType === 'ADJACENT').length === 1 ? '' : 's'} within ${currentCriteria.radius}km` : ''}
                      />
                    </div>
                  </>
                )}

                {/* No Results Message */}
                {searchResponse.results.length === 0 && (
                  <div className="flex flex-col items-start py-8 px-4">
                    <p className="text-neutral-600 mb-4">
                      No properties found matching your search criteria. Try adjusting your search parameters.
                    </p>
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="button-primary"
                    >
                      Modify Search
                    </button>
                  </div>
                )}
              </>
            )}

            {(!searchResponse || searchResponse.results.length === 0) && searchHash && (
              <div className="flex flex-col items-start py-8 md:py-16 px-4">
                <div className="mb-4 md:mb-8 text-neutral-400">
                  <AnimatedSearchLogo className="w-12 h-12 md:w-24 md:h-24" />
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
              <div className="flex flex-col items-start py-6 md:py-16 px-4">
                <div className="mb-3 md:mb-8 text-neutral-400">
                  <AnimatedSearchLogo className="w-10 h-10 md:w-24 md:h-24" />
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
          initialSearchHash={selectedSearchHash}
          forceReset={forceResetSearch}
          title={searchTitle}
        />

        {isSaveSearchModalOpen && (
          <SaveSearchModal
            isOpen={isSaveSearchModalOpen}
            onClose={() => setIsSaveSearchModalOpen(false)}
            searchCriteria={currentCriteria}
            onSave={async (name, enableNotifications) => {
              if (!profile || !searchHash) return;

              const newSavedSearch = {
                id: crypto.randomUUID(),
                name: name,
                searchHash,
                lastUpdate: new Date().toISOString(),
                enableNotifications
              };

              const updatedProfile = {
                ...profile,
                savedSearches: [...(profile.savedSearches || []), newSavedSearch]
              };

              try {
                await updateProfileData(updatedProfile);
                setIsSaveSearchModalOpen(false);
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
