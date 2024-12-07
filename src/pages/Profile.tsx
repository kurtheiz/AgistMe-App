import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, ChevronDown, Bell, BellOff, Pencil, Heart, CircleUser, CircleDollarSign, BookmarkPlus, Search, Building, Trash2 } from 'lucide-react';
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
  const [favorites, setFavorites] = useState<Record<string, { isFavorite: boolean, isLoading: boolean }>>({});

  const toggleFavorite = async (agistmentId: string) => {
    setFavorites(prev => ({
      ...prev,
      [agistmentId]: { ...prev[agistmentId], isLoading: true }
    }));

    try {
      const isFavorite = favorites[agistmentId]?.isFavorite ?? true; 
      await profileService.toggleFavorite(agistmentId, isFavorite); 
      
      setFavorites(prev => ({
        ...prev,
        [agistmentId]: { isFavorite: !isFavorite, isLoading: false }
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
      
      setFavorites(prev => ({
        ...prev,
        [agistmentId]: { ...prev[agistmentId], isLoading: false }
      }));
    }
  };

  const handleDeleteFavorite = async (favoriteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await profileService.deleteFavorite(favoriteId);
      setFavourites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success('Favorite removed');
    } catch (error) {
      console.error('Failed to delete favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  useEffect(() => {
    if (favourites) {
      const initialFavorites = favourites.reduce((acc, fav) => ({
        ...acc,
        [fav.id]: { isFavorite: true, isLoading: false }
      }), {});
      setFavorites(initialFavorites);
    }
  }, [favourites]);

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
        const response = await profileService.getFavourites({ d: true });
        setFavourites(Array.isArray(response) ? response : response.favourites);
      } catch (error) {
        console.error('Error loading favourites:', error);
        toast.error('Failed to load favourites');
      } finally {
        setIsLoadingFavourites(false);
      }
    };

    loadFavourites();
  }, [isSignedIn]);

  const handleDeleteSearch = async (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedSearches = savedSearches.filter(search => search.id !== searchId);
      await profileService.updateSavedSearches(updatedSearches);
      setSavedSearches(updatedSearches);
      toast.success('Search deleted');
    } catch (error) {
      console.error('Failed to delete search:', error);
      toast.error('Failed to delete search');
    }
  };

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
            <Disclosure>
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CircleUser className="w-5 h-5 text-neutral-500" />
                      <h2 className="text-lg font-medium">My Bio</h2>
                    </div>
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
            <Disclosure>
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="w-5 h-5 text-neutral-500" />
                      <h2 className="text-lg font-medium">My Horses</h2>
                    </div>
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
            <Disclosure>
              {({ open }) => (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-3 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-neutral-500" />
                      <span className="font-medium">My Favourites</span>
                    </div>
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
                      ) : !favourites || favourites.length === 0 ? (
                        <div className="text-neutral-600">No favourites yet</div>
                      ) : (
                        <div className="space-y-4">
                          {favourites.map((favourite) => {
                            const isInactive = favourite.status === 'HIDDEN' || favourite.status === 'REMOVED';
                            return (
                              <div 
                                key={favourite.id} 
                                className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden relative
                                  ${isInactive ? 'opacity-75' : 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50'} 
                                  transition-colors`}
                                onClick={() => !isInactive && navigate(`/agistments/${favourite.id}`)}
                              >
                                {/* Watermark for hidden/removed status */}
                                {isInactive && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-4xl font-bold text-neutral-900/20 rotate-[-30deg] uppercase">
                                      {favourite.status}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-start">
                                  <button
                                    onClick={(e) => handleDeleteFavorite(favourite.id, e)}
                                    className="flex-shrink-0 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <Trash2 
                                      className="w-5 h-5 text-neutral-400 hover:text-red-500 transition-colors"
                                    />
                                  </button>
                                  <div className="flex-grow px-4 pb-4">
                                    <div className="space-y-0.5">
                                      <h3 className="font-medium text-neutral-900 dark:text-white">
                                        {favourite.name}
                                      </h3>
                                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {favourite.location.suburb}, {favourite.location.state}
                                      </p>
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
            <Disclosure>
              {({ open }) => (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-3 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="w-5 h-5 text-neutral-500" />
                      <span className="font-medium">Saved Searches</span>
                    </div>
                    <ChevronDown
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-neutral-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pb-4">
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-neutral-600">Loading saved searches...</div>
                      ) : !savedSearches || savedSearches.length === 0 ? (
                        <div className="text-neutral-600">No saved searches yet</div>
                      ) : (
                        <div className="space-y-4">
                          {savedSearches.map((search) => {
                            const searchCriteria = decodeSearchHash(search.searchHash);
                            const location = searchCriteria.suburbs?.[0];
                            let locationDisplay = 'Any location';
                            
                            if (location?.locationType) {
                              const type = location.locationType.toLowerCase();
                              if (type === 'suburb') {
                                locationDisplay = `${location.suburb}, ${location.postcode} ${location.state}`;
                              } else if (type === 'state') {
                                locationDisplay = location.state;
                              } else if (type === 'region') {
                                locationDisplay = `${location.region}, ${location.state}`;
                              }
                              
                              if (searchCriteria.radius > 0) {
                                locationDisplay += ` within ${searchCriteria.radius}km`;
                              }
                            }

                            const filterCount = [
                              searchCriteria.paddockTypes?.length > 0,
                              searchCriteria.spaces > 0,
                              searchCriteria.maxPrice > 0,
                              searchCriteria.hasArena,
                              searchCriteria.hasRoundYard,
                              searchCriteria.facilities?.length > 0,
                              searchCriteria.careTypes?.length > 0
                            ].filter(Boolean).length;

                            return (
                              <div 
                                key={search.id}
                                className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 space-y-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                                onClick={() => {
                                  setEditingSearch(search);
                                  setShowSaveSearchModal(true);
                                }}
                              >
                                <div className="flex items-center">
                                  <button
                                    onClick={(e) => handleDeleteSearch(search.id, e)}
                                    className="flex-shrink-0 p-3 -m-4 mr-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                                  </button>
                                  <div className="flex-grow">
                                    <div>
                                      <h3 className="font-medium">{search.name}</h3>
                                      <p className="text-sm text-neutral-600">{locationDisplay}</p>
                                      <p className="text-sm text-neutral-500">{filterCount} filter{filterCount !== 1 ? 's' : ''}</p>
                                      {search.enableNotifications && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-2">
                                          <Bell className="w-3 h-3" />
                                          Notify Me
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

            {/* My Agistments */}
            {isAgistor && (
              <Disclosure>
                {({ open }) => (
                  <div className="bg-white rounded-lg shadow-sm">
                    <Disclosure.Button className="w-full px-6 py-4 text-left flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-neutral-500" />
                        <h2 className="text-lg font-medium">My Agistments</h2>
                      </div>
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
            initialName={editingSearch?.name || ''}
            initialNotifications={editingSearch?.enableNotifications || false}
            title="Saved Search"
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
