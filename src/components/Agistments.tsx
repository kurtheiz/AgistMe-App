import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse } from '../types/agistment';
import { SearchModal } from './Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageToolbar } from './PageToolbar';

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
    } else if (location.pathname === '/agistments' && !searchHash) {
      // Try to load from storage when navigating to agistments without a search hash
      loadStoredSearch();
    }
  }, [location.pathname]);

  const fetchAgistments = async (forceRefresh = false) => {
    // Only clear state if we're on the home page
    if (location.pathname === '/') {
      setAgistments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // First try to load from storage if not forcing refresh
      if (!forceRefresh) {
        const loadedFromStorage = loadStoredSearch();
        if (loadedFromStorage) {
          return; // loadStoredSearch already sets the state
        }
      }

      // If we have a search hash and either force refresh is true or storage load failed, fetch from API
      if (searchHash) {
        const response = await agistmentService.searchAgistments(searchHash);
        const newAgistments = [...(response.original || []), ...(response.adjacent || [])];
        setAgistments(newAgistments);
        
        if (response.original?.length > 0 || response.adjacent?.length > 0) {
          storeSearchInLocalStorage(searchHash, response);
        }
      } else {
        setAgistments([]); // Clear agistments if no search hash
      }
    } catch (error) {
      console.error('Error fetching agistments:', error);
      setAgistments([]);
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

  const handleSearch = (criteria: SearchCriteria) => {
    if (criteria.searchHash) {
      navigate(`/agistments/search?q=${criteria.searchHash}`);
    }
    setIsSearchModalOpen(false);
  };

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-4 mb-6">
        <MagnifyingGlassIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
        {searchHash ? 'No agistments found' : 'Find your perfect agistment'}
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
        {searchHash 
          ? 'Try adjusting your search criteria to find more options'
          : 'Start by searching for agistments in your area. You can filter by facilities, care types, and more.'}
      </p>
      <button
        onClick={onSearch}
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {searchHash ? 'Modify Search' : 'Start Searching'}
      </button>
    </div>
  );
  
  return (
    <>
      <PageToolbar 
        actions={
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/50 transition-colors"
                aria-label="Search Agistments"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="font-medium">Search</span>
              </button>
              <button 
                onClick={() => {
                  if (searchHash) {
                    setRefreshKey(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/50 transition-colors"
                aria-label="Refresh Results"
                disabled={!searchHash}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
            <div>
              {/* Right side of toolbar - can add additional actions here */}
            </div>
          </div>
        }
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {loading && agistments.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : agistments.length === 0 ? (
          <EmptyState onSearch={() => setIsSearchModalOpen(true)} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {agistments.length} {agistments.length === 1 ? 'Agistment' : 'Agistments'} Found
              </h1>
            </div>
            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
              {agistments.map((agistment) => (
                <div 
                  key={agistment.id}
                  className="bg-white dark:bg-neutral-700 rounded-lg shadow-md p-6 text-neutral-900 dark:text-white"
                >
                  {agistment.name}
                </div>
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
    </>
  );
}
