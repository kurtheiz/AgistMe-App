import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse } from '../types/agistment';
import { SearchModal } from './Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RefreshIcon } from './Icons';
import { PageToolbar } from './PageToolbar';
import { PropertyCard } from './PropertyCard';

// Local storage key for last search
const LAST_SEARCH_KEY = 'agistme_last_search';

interface StoredSearch {
  hash: string;
  timestamp: number;
  count: number;
  response: AgistmentResponse;
}

export function Agistments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agistments, setAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
          const allAgistments = [
            ...(lastSearch.response.original || []),
            ...(lastSearch.response.adjacent || [])
          ];
          console.log('Loading from storage:', allAgistments.length, 'agistments');
          setAgistments(allAgistments);
          
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
      setAgistments([]);
      setSearchParams({});
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

  const fetchAgistments = async (forceRefresh = false) => {
    // Only clear state if we're on the home page
    if (location.pathname === '/') {
      setAgistments([]);
      setLoading(false);
      return;
    }

    if (!searchHash) {
      setLoading(false);
      return;
    }

    // Try to load from storage if not forcing refresh
    if (!forceRefresh) {
      const loaded = loadStoredSearch();
      if (loaded) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await agistmentService.searchAgistments(searchHash);
      const allAgistments = [
        ...(response.original || []),
        ...(response.adjacent || [])
      ];
      console.log('List view - First agistment photos:', allAgistments[0]?.photos);
      console.log('List view - First photo type:', typeof allAgistments[0]?.photos[0]);
      console.log('List view photos:', allAgistments.map(a => a.photos));
      setAgistments(allAgistments);
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
      fetchAgistments(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAgistments(refreshKey > 0);
  }, [searchParams, refreshKey]);

  const handleSearch = (criteria: SearchCriteria & { searchHash: string }) => {
    // Clear previous results before navigating
    setAgistments([]);
    navigate(`/agistments/search?q=${criteria.searchHash}`);
    setIsSearchModalOpen(false);
  };

  const handleRefresh = useCallback(() => {
    if (searchHash && !loading) {
      setRefreshKey(prev => prev + 1);
    }
  }, [searchHash, loading]);

  if (loading && agistments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
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
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3">
        {searchHash ? 'No agistments found' : 'Find your perfect agistment'}
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
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
          <div className="w-full flex justify-between items-center">
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Search Agistments"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="hidden md:inline font-medium">Search</span>
            </button>
            <button 
              onClick={handleRefresh}
              disabled={!searchHash || loading}
              className={`hidden sm:flex items-center px-3 py-2 rounded-lg transition-colors ${
                searchHash && !loading
                  ? 'text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800' 
                  : 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              }`}
              aria-label="Refresh Results"
            >
              <RefreshIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />
      <div className="flex-grow max-w-5xl mx-auto w-full px-0 sm:px-6 lg:px-8 py-8">
        {loading && agistments.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : agistments.length === 0 ? (
          <EmptyState onSearch={() => setIsSearchModalOpen(true)} />
        ) : (
          <>
            <div className="mb-6 px-2 sm:px-0">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {agistments.length} {agistments.length === 1 ? 'Agistment' : 'Agistments'} Found
              </h1>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${loading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
              {agistments.map((agistment) => (
                <PropertyCard
                  key={agistment.id}
                  property={agistment}
                  onClick={() => navigate(`/agistment/${agistment.id}`)}
                />
              ))}
            </div>
          </>
        )}
        
        <SearchModal 
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleSearch}
          initialSearchHash={searchHash || undefined}
        />
      </div>
    </div>
  );
}
