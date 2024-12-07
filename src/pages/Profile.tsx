import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, ChevronDown, Bell, Heart, CircleUser, CircleDollarSign, BookmarkPlus, Trash2 } from 'lucide-react';
import { Disclosure } from '@headlessui/react';
import Bio from '../components/Bio';
import { BioView } from '../components/BioView';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { SavedSearch, Profile as ProfileType } from '../types/profile';
import { Favourite } from '../types/profile';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { decodeSearchHash } from '../utils/searchUtils';

export default function Profile() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);

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
    if (!isSignedIn && isLoaded) {
      navigate('/');
    }
  }, [isSignedIn, isLoaded, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      const searches = await profileService.getSavedSearches();
      setSavedSearches(searches.savedSearches);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load profile data');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">My Profile</h1>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Bio */}
            <Disclosure >
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-4 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CircleUser className="w-5 h-5 text-neutral-500" />
                      <h2 className="text-lg font-medium">My Bio</h2>
                    </div>
                    <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
                    {profile && (
                      <>
                        <BioView profile={profile} />
                        <div className="mt-6 flex justify-center">
                          <button
                            className="button-toolbar"
                            onClick={handleOpenBio}
                          >
                            <span>Edit Bio</span>
                          </button>
                        </div>
                      </>
                    )}
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* My Horses */}
            <Disclosure>
              {({ open }) => (
                <div className="bg-white rounded-lg shadow-sm">
                  <Disclosure.Button className="w-full px-4 py-4 text-left flex justify-between items-center">
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
                  <Disclosure.Button className="w-full px-4 py-4 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-neutral-500" />
                      <span className="text-lg font-medium">My Favourites</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
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
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <h3 className="text-base font-medium text-neutral-900">{favourite.name}</h3>
                                        {(favourite.status === 'HIDDEN' || favourite.status === 'REMOVED') && (
                                          <span className="chip-unavailable">
                                            {favourite.status === 'HIDDEN' ? 'Hidden' : 'Removed'}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-neutral-500">{favourite.location.suburb}, {favourite.location.state}</p>
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
                  <Disclosure.Button className="w-full px-4 py-4 text-left flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="w-5 h-5 text-neutral-500" />
                      <span className="text-lg font-medium">Saved Searches</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-6">
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
                              
                              if (searchCriteria.radius && searchCriteria.radius > 0) {
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

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto sm:mx-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-3 text-base sm:text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <LogOut className="h-5 w-5 sm:h-4 sm:w-4" />
              Sign Out
            </button>
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
        </div>
      </div>
    </div>
  );
}
