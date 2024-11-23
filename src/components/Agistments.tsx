import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse } from '../types/agistment';
import { SearchModal } from './Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PageToolbar } from './PageToolbar';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

// Local storage key for last search
const LAST_SEARCH_KEY = 'agistme_last_search';
const initialFacilities: any[] = [];

interface StoredSearch {
  hash: string;
  timestamp: number;
  count: number;
  response: AgistmentResponse;
}

const decodeSearchHash = (hash: string): SearchCriteria => {
  try {
    const decodedSearch = JSON.parse(atob(hash));
    return {
      suburbs: decodedSearch.s?.map((s: any) => ({
        id: s.i,
        suburb: s.n,
        postcode: s.p,
        state: s.t,
        region: s.r,
        geohash: s.g,
        locationType: s.l
      })) || [],
      radius: decodedSearch.r || 0,
      paddockTypes: decodedSearch.pt || [],
      spaces: decodedSearch.sp || 0,
      maxPrice: decodedSearch.mp || 0,
      hasArena: decodedSearch.a || false,
      hasRoundYard: decodedSearch.ry || false,
      facilities: decodedSearch.f || initialFacilities,
      careTypes: decodedSearch.ct || []
    };
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
      facilities: initialFacilities,
      careTypes: []
    };
  }
};

export function Agistments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [originalAgistments, setOriginalAgistments] = useState<Agistment[]>([]);
  const [adjacentAgistments, setAdjacentAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria | null>(null);
  const searchHash = searchParams.get('q');

  // Store search in local storage if it has results
  const storeSearchInLocalStorage = (hash: string, response: AgistmentResponse) => {
    try {
      const totalCount = (response.original?.length || 0) + (response.adjacent?.length || 0);
      const lastSearch: StoredSearch = {
        hash,
        timestamp: Date.now(),
        count: totalCount,
        response
      };
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(lastSearch));
    } catch (error) {
      console.error('Error storing search in local storage:', error);
    }
  };

  // Load last search from local storage
  const loadStoredSearch = () => {
    try {
      const storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
      if (storedSearch) {
        const lastSearch: StoredSearch = JSON.parse(storedSearch);
        // Only use stored results if they're less than 24 hours old
        const isRecent = Date.now() - lastSearch.timestamp < 24 * 60 * 60 * 1000;
        
        if (isRecent && lastSearch.response) {
          const original = lastSearch.response.original || [];
          const adjacent = lastSearch.response.adjacent || [];
          console.log('Loading from storage:', original.length + adjacent.length, 'agistments');
          setOriginalAgistments(original);
          setAdjacentAgistments(adjacent);
          
          // Update URL with the stored search hash if we're on the agistments page
          if (location.pathname === '/agistments' && !searchHash) {
            setSearchParams({ q: lastSearch.hash });
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading stored search:', error);
      return false;
    }
  };

  // Add effect to clear state when navigating home
  useEffect(() => {
    if (location.pathname === '/') {
      setOriginalAgistments([]);
      setAdjacentAgistments([]);
    } else if (location.pathname === '/agistments/search' && !searchHash) {
      // Try to load from storage when navigating to agistments/search without a search hash
      const loaded = loadStoredSearch();
      if (loaded) {
        const storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
        if (storedSearch) {
          const lastSearch: StoredSearch = JSON.parse(storedSearch);
          navigate(`/agistments/search?q=${lastSearch.hash}`, { replace: true });
        }
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (searchHash) {
      try {
        const decodedCriteria = decodeSearchHash(searchHash);
        setCurrentCriteria(decodedCriteria);
      } catch (error) {
        console.error('Error decoding search hash:', error);
      }
    } else {
      setCurrentCriteria(null);
    }
  }, [searchHash]);

  const fetchAgistments = async () => {
    // Only clear state if we're on the home page
    if (location.pathname === '/') {
      setOriginalAgistments([]);
      setAdjacentAgistments([]);
      setLoading(false);
      return;
    }

    if (!searchHash) {
      setLoading(false);
      return;
    }

    // Try to load from storage
    const loaded = loadStoredSearch();
    if (loaded) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await agistmentService.searchAgistments(searchHash);
      setOriginalAgistments(response.original || []);
      setAdjacentAgistments(response.adjacent || []);
      storeSearchInLocalStorage(searchHash, response);
    } catch (error) {
      console.error('Error fetching agistments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add effect to handle route changes
  useEffect(() => {
    if (location.pathname === '/agistments') {
      fetchAgistments();
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAgistments();
  }, [searchParams]);

  const handleSearch = (criteria: SearchCriteria & { searchHash: string }) => {
    // Clear previous results before navigating
    setOriginalAgistments([]);
    setAdjacentAgistments([]);
    navigate(`/agistments/search?q=${criteria.searchHash}`);
    setIsSearchModalOpen(false);
  };

  if (loading && originalAgistments.length === 0 && adjacentAgistments.length === 0) {
    return (
      <>
        <PageToolbar
          actions={
            <div className="flex items-center justify-between w-full">
              {/* Skeleton for agistments count */}
              <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-600 rounded animate-pulse"></div>
                <div className="h-9 w-9 bg-neutral-200 dark:bg-neutral-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          }
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  interface EmptyStateProps {
    onSearch: () => void;
  }

  const EmptyState = ({ onSearch }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center flex-grow">
      <div className="relative mb-8 w-48 h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-transparent dark:from-primary-900/30 dark:via-primary-800/10 rounded-full blur-2xl"></div>
        <div className="relative w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" className="stroke-primary-200 dark:stroke-primary-400" strokeWidth="1" />
            
            {/* AgistMe Logo in the center */}
            <image
              href="/AgistMeLogo.svg"
              x="30"
              y="30"
              width="40"
              height="40"
              className="opacity-80 dark:invert"
            />
            
            {/* Animated magnifying glass */}
            <g className="animate-[searchMove_4s_ease-in-out_infinite]">
              <g className="transform translate-x-2 translate-y-2">
                {/* Glass background with slight transparency */}
                <circle
                  cx="42"
                  cy="42"
                  r="16"
                  className="fill-white/80 dark:fill-neutral-800/80 backdrop-blur-sm"
                />
                
                {/* Glass border */}
                <circle
                  cx="42"
                  cy="42"
                  r="16"
                  className="fill-none stroke-primary-600 dark:stroke-primary-400"
                  strokeWidth="2"
                />
                
                {/* Handle */}
                <line
                  x1="54"
                  y1="54"
                  x2="64"
                  y2="64"
                  className="stroke-primary-600 dark:stroke-primary-400"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3 px-4 sm:px-0 text-center">
        {searchHash ? 'No agistments found' : 'Find your perfect agistment'}
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md px-4 sm:px-0 text-center">
        {searchHash 
          ? 'Try adjusting your search criteria to find more options'
          : 'Start by searching for agistments in your area. You can filter by facilities, care types, and more.'}
      </p>
      <button
        onClick={onSearch}
        className="mt-8 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors"
      >
        Start Your Search
      </button>
    </div>
  );
  
  return (
    <div className="flex flex-col flex-grow">
      <PageToolbar 
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors relative"
              aria-label="Search Agistments"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search</span>
              {filterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                  {filterCount}
                </span>
              )}
            </button>
          </div>
        }
      />
      <div className="flex-grow max-w-5xl mx-auto w-full px-0 sm:px-6 lg:px-8 py-4">
        {loading && originalAgistments.length === 0 && adjacentAgistments.length === 0 ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : originalAgistments.length === 0 && adjacentAgistments.length === 0 ? (
          <EmptyState onSearch={() => setIsSearchModalOpen(true)} />
        ) : (
          <>
            {originalAgistments.length > 0 && (
              <>
                <div className="mb-3 px-2 sm:px-0">
                  <h1 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {originalAgistments.length} {originalAgistments.length === 1 ? 'Agistment' : 'Agistments'} found
                    {currentCriteria?.suburbs && currentCriteria.suburbs.length > 0 && (
                      <> in {(() => {
                        const firstLocation = currentCriteria.suburbs[0];
                        console.log('Location type:', firstLocation.locationType);
                        console.log('Full location:', firstLocation);
                        const locationType = firstLocation.locationType;
                        switch (locationType) {
                          case 'SUBURB':
                            return `${firstLocation.suburb}, ${firstLocation.state} ${firstLocation.postcode}`;
                          case 'STATE':
                            return `${firstLocation.suburb} state`;
                          case 'REGION':
                            return `${firstLocation.region} region`;
                          default:
                            return firstLocation.suburb;
                        }
                      })()}
                        {currentCriteria.suburbs.length > 1 && ' and other locations'}
                      </>
                    )}
                  </h1>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 ${loading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
                  {originalAgistments.map((agistment) => (
                    <PropertyCard
                      key={agistment.id}
                      property={agistment}
                      onClick={() => navigate(`/agistment/${agistment.id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {adjacentAgistments.length > 0 && (
              <>
                <div className="mb-3 px-2 sm:px-0">
                  <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {adjacentAgistments.length} {adjacentAgistments.length === 1 ? 'Agistment' : 'Agistments'} found in adjacent locations
                  </h2>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${loading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
                  {adjacentAgistments.map((agistment) => (
                    <PropertyCard
                      key={agistment.id}
                      property={agistment}
                      onClick={() => navigate(`/agistment/${agistment.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        <SearchModal 
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleSearch}
          initialSearchHash={searchHash || undefined}
          onFilterCountChange={setFilterCount}
        />
      </div>
    </div>
  );
}
