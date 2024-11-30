import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { SearchModal } from '../components/Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { Agistment } from '../types/agistment';
import { SearchIcon } from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import PropertyCard from '../components/PropertyCard';

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
      facilities: decodedSearch.f || [],
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
      facilities: [],
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

  // Helper function to format location
  const formatLocation = (suburb: string, region: string, state: string) => {
    if (suburb && region && state) {
      return `${suburb}, ${region}, ${state}`;
    } else if (region && state) {
      return `${region}, ${state}`;
    } else if (state) {
      return state;
    }
    return '';
  };

  // Helper function to get locations text
  const getLocationsText = () => {
    if (!currentCriteria?.suburbs?.length) return '';
    
    const mainLocation = currentCriteria.suburbs[0];
    const formattedMainLocation = formatLocation(
      mainLocation.suburb,
      mainLocation.region,
      mainLocation.state
    );

    if (currentCriteria.suburbs.length === 1) {
      return formattedMainLocation;
    }

    return `${formattedMainLocation} and other locations`;
  };

  // Load search results whenever the hash changes
  useEffect(() => {
    if (searchHash) {
      const decodedCriteria = decodeSearchHash(searchHash);
      setCurrentCriteria(decodedCriteria);
      setIsFetching(true);
      
      agistmentService.searchAgistments(searchHash)
        .then(response => {
          if (response) {
            // Handle the actual API response structure
            setOriginalAgistments(response.original || []);
            setAdjacentAgistments(response.adjacent || []); 
          } else {
            console.error('Invalid response format:', response);
            setOriginalAgistments([]);
            setAdjacentAgistments([]);
          }
        })
        .catch(error => {
          console.error('Error fetching agistments:', error);
          setOriginalAgistments([]);
          setAdjacentAgistments([]);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      // No search hash, clear results
      setOriginalAgistments([]);
      setAdjacentAgistments([]);
      setCurrentCriteria(null);
    }
  }, [searchHash]);

  useEffect(() => {
    if (searchParams.get('openSearch') === 'true') {
      setIsSearchModalOpen(true);
      // Remove the openSearch parameter to prevent reopening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openSearch');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSearch = (criteria: SearchCriteria & { searchHash: string }) => {
    setIsSearchModalOpen(false);
    
    // Update URL after search, which will trigger the useEffect to load results
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', criteria.searchHash);
    navigate({ search: newParams.toString() });
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
        {searchHash 
          ? `No agistments found in ${getLocationsText()}`
          : 'Find your perfect agistment'}
      </h2>
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
          {isFetching ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : originalAgistments && originalAgistments.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {originalAgistments.length === 1
                  ? `1 agistment found in ${getLocationsText()}`
                  : `${originalAgistments.length} agistments found in ${getLocationsText()}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {originalAgistments.map((agistment) => (
                  <PropertyCard key={agistment.id} agistment={agistment} onClick={() => navigate(`/agistments/${agistment.id}`)} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState onSearch={() => setIsSearchModalOpen(true)} />
          )}

          {adjacentAgistments.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base text-neutral-600 dark:text-neutral-400 mb-4">
                {adjacentAgistments.length === 1
                  ? "1 agistment found in other locations"
                  : `${adjacentAgistments.length} agistments found in other locations`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adjacentAgistments.map((agistment) => (
                  <PropertyCard key={agistment.id} agistment={agistment} onClick={() => navigate(`/agistments/${agistment.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
