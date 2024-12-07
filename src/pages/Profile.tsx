import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, ChevronDown, Bell, BellOff, Pencil } from 'lucide-react';
import { useAgistor } from '../hooks/useAgistor';
import { Disclosure } from '@headlessui/react';
import Bio from '../components/Bio';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { SavedSearch } from '../types/profile';
import { Favourite } from '../types/profile';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { decodeSearchHash } from '../utils/searchUtils';

export default function Profile() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isAgistor = useAgistor();
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [showProfileInEnquiry, setShowProfileInEnquiry] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);

  const formatLastUpdate = (date: string) => {
    if (!date) return '';
    
    const now = new Date();
    const updateDate = new Date(date);

    // Check if date is valid
    if (isNaN(updateDate.getTime())) return '';
    
    const diffInHours = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Less than an hour ago'
        : `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return updateDate.toLocaleDateString();
  };

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      navigate('/');
    }
  }, [isSignedIn, isLoaded, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getProfile();
        setShowProfileInEnquiry(profile.showProfileInEnquiry);
        const searches = await profileService.getSavedSearches();
        setSavedSearches(searches.savedSearches);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadFavourites = async () => {
      if (!isSignedIn) return;
      
      setIsLoadingFavourites(true);
      try {
        const response = await profileService.getFavourites();
        setFavourites(response.favourites);
      } catch (error) {
        console.error('Error loading favourites:', error);
        toast.error('Failed to load favourites');
      } finally {
        setIsLoadingFavourites(false);
      }
    };

    loadFavourites();
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOpenBio = () => {
    setIsBioOpen(true);
  };

  const handleCloseBio = () => {
    setIsBioOpen(false);
  };

  const handleEditSearch = async (name: string, enableNotifications: boolean) => {
    if (!editingSearch) return;
    
    try {
      const updatedSearches = savedSearches.map(search => {
        if (search.id === editingSearch.id) {
          return {
            ...search,
            name,
            enableNotifications
          };
        }
        return search;
      });
      await profileService.updateSavedSearches(updatedSearches);
      setSavedSearches(updatedSearches);
      toast.success('Search updated');
    } catch (error) {
      console.error('Failed to update search:', error);
      toast.error('Failed to update search');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">My Profile</h1>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Bio */}
            <Disclosure defaultOpen={true}>
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                    <h2 className="text-lg font-medium">My Bio</h2>
                    <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Bio sharing</label>
                        <p className="text-neutral-600">
                          Bio sharing {showProfileInEnquiry ? 'enabled' : 'disabled'}
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={handleOpenBio}
                      >
                        Edit Bio
                      </button>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* My Horses */}
            <Disclosure defaultOpen={true}>
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                    <h2 className="text-lg font-medium">My Horses</h2>
                    <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
                    <div className="space-y-4">
                      <p className="text-neutral-600">
                        View and manage your horses
                      </p>
                      <button
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => navigate('/horses')}
                      >
                        View Horses
                      </button>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* Favourites */}
            <Disclosure defaultOpen={true}>
              {({ open }) => (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-3 text-left flex justify-between items-center">
                    <span className="font-medium">
                      {favourites.length === 0
                        ? 'No Favourites'
                        : favourites.length === 1
                        ? '1 Favourite'
                        : `${favourites.length} Favourites`}
                    </span>
                    <ChevronDown
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-neutral-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pb-4">
                    <div className="space-y-4">
                      {isLoadingFavourites ? (
                        <div className="text-neutral-600">Loading favourites...</div>
                      ) : favourites.length === 0 ? (
                        <div className="text-neutral-600">No favourites yet</div>
                      ) : (
                        <div className="space-y-4">
                          {favourites.map((favourite) => {
                            const isInactive = favourite.status === 'HIDDEN' || favourite.status === 'REMOVED';
                            const statusText = favourite.status;
                            return (
                              <div 
                                key={favourite.id} 
                                className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm relative overflow-hidden
                                  ${isInactive 
                                    ? 'opacity-60' 
                                    : 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors'
                                  }`}
                                onClick={() => !isInactive && navigate(`/agistments/${favourite.id}`)}
                              >
                                {isInactive && (
                                  <div className="absolute inset-0 flex items-center justify-center rotate-[-35deg] z-10">
                                    <span className="text-red-500/50 dark:text-red-500/60 text-2xl font-bold whitespace-nowrap">
                                      {statusText}
                                    </span>
                                  </div>
                                )}
                                <div className="p-4 relative z-0">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex items-center gap-2">
                                      {favourite.photo && (
                                        <img 
                                          src={favourite.photo} 
                                          alt={favourite.name}
                                          className={`w-16 h-16 object-cover rounded-lg ${isInactive ? 'grayscale' : ''}`}
                                        />
                                      )}
                                      <div className="flex flex-col">
                                        <span className="font-medium">{favourite.name}</span>
                                        {favourite.location && (
                                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {favourite.location}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      {favourite.lastUpdate && (
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                          Last updated: {formatLastUpdate(favourite.lastUpdate)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* Saved Searches */}
            <Disclosure defaultOpen={true}>
              {({ open }) => (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-3 text-left flex justify-between items-center">
                    <span className="font-medium">
                      {savedSearches.length === 0
                        ? 'No Saved Searches'
                        : savedSearches.length === 1
                        ? '1 Saved Search'
                        : `${savedSearches.length} Saved Searches`}
                    </span>
                    <ChevronDown
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-neutral-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-neutral-600">Loading saved searches...</div>
                      ) : savedSearches.length === 0 ? (
                        <div className="text-neutral-600">No saved searches yet</div>
                      ) : (
                        <div className="space-y-4">
                          {savedSearches.map((search) => {
                            const decodedSearch = decodeSearchHash(search.searchHash);
                            if (!decodedSearch) return null;
                            
                            const locationName = decodedSearch.suburbs?.[0]?.suburb || 'Any location';
                            const radius = decodedSearch.radius || 0;
                            
                            // Format additional details
                            const details = [];
                            if (decodedSearch.spaces > 0) details.push({ type: 'spaces', value: `${decodedSearch.spaces} spaces` });
                            if (decodedSearch.maxPrice > 0) details.push({ type: 'maxPrice', value: `$${decodedSearch.maxPrice}/week` });

                            if (decodedSearch.paddockTypes?.length > 0) {
                              details.push(...decodedSearch.paddockTypes.map(type => ({
                                type: 'paddockTypes',
                                value: type.charAt(0).toUpperCase() + type.slice(1)
                              })));
                            }

                            if (decodedSearch.hasArena) details.push({ type: 'hasArena', value: 'Arena' });
                            if (decodedSearch.hasRoundYard) details.push({ type: 'hasRoundYard', value: 'Round Yard' });

                            if (decodedSearch.facilities?.length > 0) {
                              details.push(...decodedSearch.facilities.map(facility => {
                                switch (facility) {
                                  case 'feedRoom': return { type: 'facilities', value: 'Feed Room' };
                                  case 'tackRoom': return { type: 'facilities', value: 'Tack Room' };
                                  case 'floatParking': return { type: 'facilities', value: 'Float Parking' };
                                  case 'hotWash': return { type: 'facilities', value: 'Hot Wash' };
                                  case 'stables': return { type: 'facilities', value: 'Stables' };
                                  case 'tieUp': return { type: 'facilities', value: 'Tie Up' };
                                  default: return { type: 'facilities', value: facility };
                                }
                              }));
                            }

                            if (decodedSearch.careTypes?.length > 0) {
                              details.push(...decodedSearch.careTypes.map(care => ({
                                type: 'careTypes',
                                value: `${care} Care`
                              })));
                            }

                            return (
                              <div key={search.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                                <div className="p-4">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium">{search.name}</span>
                                      <button
                                        onClick={() => {
                                          setEditingSearch(search);
                                          setShowSaveSearchModal(true);
                                        }}
                                        className="button-toolbar"
                                        title="Edit saved search"
                                      >
                                        <Pencil className="w-4 h-4" />
                                        <span>Edit</span>
                                      </button>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {locationName}{radius > 0 ? ` within ${radius}km` : ''}
                                      </div>
                                      {details.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {details.map((detail) => (
                                            <span
                                              key={`${detail.type}-${detail.value}`}
                                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                            >
                                              {detail.value}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex flex-col space-y-1 mt-2">
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                          Last updated: {formatLastUpdate(search.lastUpdate)}
                                        </div>
                                        <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit
                                          ${search.enableNotifications 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                          }`}>
                                          {search.enableNotifications ? (
                                            <>
                                              <Bell className="h-3.5 w-3.5" />
                                              <span>Notifications on</span>
                                            </>
                                          ) : (
                                            <>
                                              <BellOff className="h-3.5 w-3.5" />
                                              <span>Notifications off</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* My Agistments */}
            {isAgistor && (
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div className="bg-white rounded-lg shadow-sm">
                    <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                      <h2 className="text-lg font-medium">My Agistments</h2>
                      <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-6 pb-6">
                      <div className="space-y-4">
                        <p className="text-neutral-600">
                          View and manage your agistment listings
                        </p>
                        <button
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                          onClick={() => navigate('/agistments/my')}
                        >
                          View Agistments
                        </button>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            )}
          </div>

          {/* Bio Modal */}
          <Bio isOpen={isBioOpen} onClose={handleCloseBio} />

          {/* Save Search Modal */}
          <SaveSearchModal
            isOpen={showSaveSearchModal}
            onClose={() => {
              setShowSaveSearchModal(false);
              setEditingSearch(null);
            }}
            searchCriteria={editingSearch ? decodeSearchHash(editingSearch.searchHash) : null}
            onSave={handleEditSearch}
            initialName={editingSearch?.name}
            initialNotifications={editingSearch?.enableNotifications}
          />

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto sm:mx-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-3 text-base sm:text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <LogOut className="h-5 w-5 sm:h-4 sm:w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
