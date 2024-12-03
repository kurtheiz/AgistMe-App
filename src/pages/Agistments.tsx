import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { SearchModal } from '../components/Search/SearchModal';
import { SearchCriteria } from '../types/search';
import { Agistment } from '../types/agistment';
import { Search, Star, ChevronDown, BookmarkPlus } from 'lucide-react';
import { PageToolbar } from '../components/PageToolbar';
import { AgistmentList } from '../components/AgistmentList';
import { useProfile } from '../context/ProfileContext';
import { StableIcon } from '../components/Icons/StableIcon';

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
  const { profile, updateProfileData } = useProfile();
  const [originalAgistments, setOriginalAgistments] = useState<Agistment[]>([]);
  const [adjacentAgistments, setAdjacentAgistments] = useState<Agistment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(() => searchParams.get('openSearch') === 'true');
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedSearchHash, setSelectedSearchHash] = useState('');
  const [forceResetSearch, setForceResetSearch] = useState(false);
  const [searchTitle, setSearchTitle] = useState('Search Properties');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchHash = searchParams.get('q') || '';

  // Helper function to format location
  const formatLocation = (suburb: string, region: string, state: string) => {
    if (suburb && region && state) {
      return `${suburb}, ${state}`;
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
      
      // Remove any trailing slashes from the search hash
      const cleanSearchHash = searchHash.replace(/\/$/, '');
      
      agistmentService.searchAgistments(cleanSearchHash)
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

  const handleSearch = (criteria: SearchCriteria & { searchHash: string }) => {
    setIsSearchModalOpen(false);
    
    // Update URL after search, which will trigger the useEffect to load results
    // Remove any trailing slashes and ensure clean URL construction
    const searchUrl = `/agistments?q=${encodeURIComponent(criteria.searchHash)}`.replace(/\/+/g, '/');
    navigate(searchUrl, { replace: true });
  };

  const handleFavorites = () => {
    navigate('/agistments/favourites');
  };

  const handleSaveSearch = async () => {
    if (!profile || !searchHash) return;

    // Create new saved search
    const newSavedSearch = {
      id: crypto.randomUUID(),
      name: `Search in ${getLocationsText()}`,
      searchHash,
      lastUpdate: new Date().toISOString()
    };

    // Add to profile's saved searches
    const updatedProfile = {
      ...profile,
      savedSearches: [...(profile.savedSearches || []), newSavedSearch]
    };

    try {
      await updateProfileData(updatedProfile);
    } catch (error) {
      console.error('Failed to save search:', error);
      // You might want to show an error toast here
    }
  };

  const handleSavedSearchSelect = (searchHash: string, name: string) => {
    setIsSearchDropdownOpen(false);
    setIsSearchModalOpen(true);
    setSelectedSearchHash(searchHash);
    setSearchTitle(name);
  };

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
                    <ChevronDown className="w-4 h-4 hidden md:inline" />
                  )}
                </button>

                {isSearchDropdownOpen && (profile?.savedSearches?.length ?? 0) > 0 && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setIsSearchDropdownOpen(false);
                        setIsSearchModalOpen(true);
                        setSelectedSearchHash('');
                        setForceResetSearch(true);
                        setSearchTitle('New Search');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100"
                    >
                      New Search
                    </button>
                    <div className="h-px bg-neutral-200 my-1" />
                    {profile?.savedSearches?.map((search) => (
                      <button
                        key={search.id}
                        onClick={() => handleSavedSearchSelect(search.searchHash, search.name)}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100"
                      >
                        {search.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleFavorites}
                className="button-toolbar inline-flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span className="hidden md:inline">Favorites</span>
              </button>
            </div>
            {profile && searchHash && (originalAgistments.length > 0 || adjacentAgistments.length > 0) && (
              <button
                onClick={handleSaveSearch}
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
          <div className="text-center pb-8 md:px-4 text-gray-500">
            {originalAgistments.length > 0 && (
              <AgistmentList 
                agistments={originalAgistments} 
                title={`${originalAgistments.length} ${originalAgistments.length === 1 ? 'Agistment' : 'Agistments'} found in ${getLocationsText()}`}
                showCount={false}
              />
            )}
            
            {adjacentAgistments.length > 0 && (
              <div className="mt-8">
                <AgistmentList 
                  agistments={adjacentAgistments} 
                  title={`${adjacentAgistments.length} ${adjacentAgistments.length === 1 ? 'Agistment' : 'Agistments'} found in a ${currentCriteria?.radius || 0}km radius`}
                  showCount={false}
                />
              </div>
            )}
            
            {originalAgistments.length === 0 && adjacentAgistments.length === 0 && searchHash && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="mb-8 text-neutral-400">
                  <StableIcon className="w-24 h-24" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">No Properties Found</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md text-center">
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
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="mb-8 text-neutral-400">
                  <StableIcon className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Find your perfect Agistment</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg text-center leading-relaxed">
                  Your perfect agistment journey starts here. Search by location, facilities, and care options to find the ideal home for your horse.
                </p>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="button-primary text-lg px-8 py-3"
                >
                  Start Searching
                </button>
              </div>
            )}
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
      </div>
    </>
  );
}
