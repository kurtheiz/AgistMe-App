import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse } from '../types/agistment';
import { SearchModal } from '../components/Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { SearchIcon } from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import PropertyCard from '../components/PropertyCard';

// Local storage key for last search
const LAST_SEARCH_KEY = 'agistme_last_search';
const initialFacilities: any[] = [];

interface StoredSearch {
  hash: string;
  timestamp: number;
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [originalAgistments, setOriginalAgistments] = useState<Agistment[]>([]);
  const [adjacentAgistments, setAdjacentAgistments] = useState<Agistment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(() => searchParams.get('openSearch') === 'true');
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria | null>(null);
  const searchHash = searchParams.get('q') || '';

  // Load last search from localStorage on mount or when navigating to /agistments
  useEffect(() => {
    const storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
    
    // If we have a search hash in URL, use that
    if (searchHash) {
      if (storedSearch) {
        try {
          const lastSearch: StoredSearch = JSON.parse(storedSearch);
          if (lastSearch.hash === searchHash) {
            // Only use stored results if they're less than 5 minutes old
            const isRecent = Date.now() - lastSearch.timestamp < 5 * 60 * 1000;
            if (isRecent && lastSearch.response) {
              setOriginalAgistments(lastSearch.response.original || []);
              setAdjacentAgistments(lastSearch.response.adjacent || []);
              const decodedCriteria = decodeSearchHash(searchHash);
              setCurrentCriteria(decodedCriteria);
              return;
            } else if (!isRecent) {
              // Data is stale, fetch from API
              const criteria = decodeSearchHash(searchHash);
              setCurrentCriteria(criteria);
              handleSearch(criteria);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading stored search:', error);
        }
      }
      // If we get here, either there was no stored search or it was invalid/expired
      // Execute a new search with the hash
      const decodedCriteria = decodeSearchHash(searchHash);
      setCurrentCriteria(decodedCriteria);
      setIsFetching(true);
      agistmentService.searchAgistments(searchHash)
        .then(response => {
          setOriginalAgistments(response.original || []);
          setAdjacentAgistments(response.adjacent || []);
          storeSearchInLocalStorage(searchHash, response);
        })
        .catch(error => {
          console.error('Error fetching agistments:', error);
          setOriginalAgistments([]);
          setAdjacentAgistments([]);
        })
        .finally(() => {
          setIsFetching(false);
        });
      return;
    }

    // If no search hash in URL but we have a stored search, load and use it
    if (storedSearch && !searchHash) {
      try {
        const lastSearch: StoredSearch = JSON.parse(storedSearch);
        const isRecent = Date.now() - lastSearch.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && lastSearch.response) {
          setOriginalAgistments(lastSearch.response.original || []);
          setAdjacentAgistments(lastSearch.response.adjacent || []);
          const decodedCriteria = decodeSearchHash(lastSearch.hash);
          setCurrentCriteria(decodedCriteria);
          // Update URL with the stored search hash
          const newParams = new URLSearchParams(searchParams);
          newParams.set('q', lastSearch.hash);
          navigate({ search: newParams.toString() }, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error loading stored search:', error);
      }
    }

    // If we get here, we have no valid search to load
    setOriginalAgistments([]);
    setAdjacentAgistments([]);
    setCurrentCriteria(null);
  }, [searchHash, navigate, searchParams]);

  useEffect(() => {
    if (searchParams.get('openSearch') === 'true') {
      setIsSearchModalOpen(true);
      // Remove the openSearch parameter to prevent reopening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openSearch');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSearch = async (criteria: SearchCriteria & { searchHash: string }) => {
    setIsSearchModalOpen(false);
    setIsFetching(true);
    
    setCurrentCriteria(criteria);
    try {
      const response = await agistmentService.searchAgistments(criteria.searchHash);
      setOriginalAgistments(response.original || []);
      setAdjacentAgistments(response.adjacent || []);
      storeSearchInLocalStorage(criteria.searchHash, response);
      // Update URL after successful search
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', criteria.searchHash);
      navigate({ search: newParams.toString() });
    } catch (error) {
      console.error('Error fetching agistments:', error);
      setOriginalAgistments([]);
      setAdjacentAgistments([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Store search in local storage if it has results
  const storeSearchInLocalStorage = (hash: string, response: AgistmentResponse) => {
    const storedSearch: StoredSearch = {
      hash,
      timestamp: Date.now(),
      response
    };
    localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(storedSearch));
  };

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
        Search
      </button>
    </div>
  );
  
  return (
    <div className="flex flex-col flex-grow">
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
        initialSearchHash={searchHash}
      />
      <PageToolbar 
        actions={
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative
                  bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
              >
                <SearchIcon className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        }
      />
      <div className="flex-grow max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-8 py-4">
        <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
          {originalAgistments.length > 0 && (
            <div>
              <div className="mb-3 px-2 sm:px-0">
                <h1 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {originalAgistments.length} {originalAgistments.length === 1 ? 'Agistment' : 'Agistments'} found
                  {currentCriteria?.suburbs && currentCriteria.suburbs.length > 0 && (
                    <>{` in ${(() => {
                      const firstLocation = currentCriteria.suburbs[0];
                      switch (firstLocation.locationType) {
                        case 'STATE':
                          return firstLocation.state;
                        case 'REGION':
                          return `${firstLocation.region}, ${firstLocation.state}`;
                        default:
                          return firstLocation.suburb;
                      }
                    })()}${currentCriteria.suburbs.length > 1 ? ' and other locations' : ''}`}</>
                  )}
                </h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {originalAgistments.map((agistment: Agistment) => (
                  <PropertyCard
                    key={agistment.id}
                    agistment={agistment}
                    onClick={() => navigate(`/agistments/${agistment.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {adjacentAgistments.length > 0 && (
            <div>
              <div className="mb-3 px-2 sm:px-0">
                <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {adjacentAgistments.length} {adjacentAgistments.length === 1 ? 'Agistment' : 'Agistments'} found in adjacent locations
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {adjacentAgistments.map((agistment: Agistment) => (
                  <PropertyCard
                    key={agistment.id}
                    agistment={agistment}
                    onClick={() => navigate(`/agistments/${agistment.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {!isFetching && originalAgistments.length === 0 && adjacentAgistments.length === 0 ? (
          <EmptyState onSearch={() => setIsSearchModalOpen(true)} />
        ) : null}
      </div>
    </div>
  );
}
