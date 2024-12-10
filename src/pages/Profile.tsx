import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, ChevronDown, Bell, Heart, CircleUser, Bookmark, Trash2, MoreVertical, Pencil, Check } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, Transition } from '@headlessui/react';
import Bio from '../components/Bio';
import { BioView } from '../components/BioView';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { SavedSearch, Profile as ProfileType } from '../types/profile';
import { Favourite } from '../types/profile';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { decodeSearchHash } from '../utils/searchUtils';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationsStore } from '../stores/notifications.store';

export default function Profile() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isBioOpenState, setIsBioOpenState] = useState(false);
  const { 
    notifications, 
    setNotifications,
    isLoading: isLoadingNotifications,
    setIsLoading: setIsLoadingNotifications,
    updateNotification
  } = useNotificationsStore();

  useEffect(() => {
    if (searchParams.get('section') === 'saved-searches') {
      // Scroll to the saved searches section
      setTimeout(() => {
        const element = document.getElementById('saved-searches-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Find and click the disclosure button
          const button = element.querySelector('button');
          if (button) {
            button.click();
          }
        }
      }, 100);
    }
  }, [searchParams]);

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

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isSignedIn) return;
      
      setIsLoadingNotifications(true);
      try {
        const response = await profileService.getNotifications();
        setNotifications(response.notifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [isSignedIn, setNotifications, setIsLoadingNotifications]);

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
    setIsBioOpenState(true);
  };

  const handleCloseBio = () => {
    setIsBioOpenState(false);
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

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Find the notification to mark as read
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Mark as read if not already read
      if (!notification.read) {
        // Update local state through the store
        updateNotification(notificationId, { read: true });
        
        // Create updated notifications array for the API
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        
        // Update the server
        await profileService.updateNotifications(updatedNotifications);
      }

      // Navigate based on notification type
      if (notification.agistmentId) {
        navigate(`/agistments/${notification.agistmentId}`);
      } else if (notification.searchId) {
        // Find the saved search to get its hash
        const savedSearch = savedSearches.find(s => s.id === notification.searchId);
        if (savedSearch) {
          navigate(`/agistments?q=${savedSearch.searchHash}`);
        } else {
          console.error('Saved search not found:', notification.searchId);
          toast.error('Could not find saved search details');
        }
      }
    } catch (error) {
      console.error('Error handling notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      await profileService.updateNotifications(updatedNotifications);
      setNotifications(updatedNotifications);
      toast.success('Notification removed');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to remove notification');
    }
  };

  const handleToggleRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Update local state through the store
      updateNotification(notificationId, { read: !notification.read });

      // Create updated notifications array for the API
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: !n.read } : n
      );

      // Update the server
      await profileService.updateNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
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

        <Disclosure>
          <div className="mb-6">
            <DisclosureButton className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <Bell className={`h-5 w-5 ${notifications.filter(n => !n.read).length > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                <span className="font-medium text-lg">Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </DisclosureButton>
            <DisclosurePanel className="mt-3">
              <div className="space-y-3 bg-white rounded-lg shadow p-4">
                {isLoadingNotifications ? (
                  <div className="text-center py-4">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50'
                      } cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100 relative`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm text-gray-900 ${!notification.read ? 'font-semibold' : ''} pr-8`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Menu as="div" className="relative">
                          {({ open }) => (
                            <>
                              <Menu.Button 
                                className="p-2 hover:bg-gray-100 rounded-full absolute top-0 right-0 m-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </Menu.Button>
                              <Transition
                                show={open}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items 
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]"
                                >
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-gray-100' : ''
                                        } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                        onClick={(e) => handleToggleRead(e, notification.id)}
                                      >
                                        {notification.read ? (
                                          <>
                                            <Check className="w-4 h-4 mr-3 text-gray-400 rotate-180" />
                                            Mark as Unread
                                          </>
                                        ) : (
                                          <>
                                            <Check className="w-4 h-4 mr-3 text-gray-400" />
                                            Mark as Read
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-gray-100' : ''
                                        } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </>
                          )}
                        </Menu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DisclosurePanel>
          </div>
        </Disclosure>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Bio */}
            <div id="bio-section">
              <Disclosure>
                {({ open }) => (
                  <div className="bg-white rounded-lg shadow-sm">
                    <DisclosureButton className="w-full px-4 py-4 text-left flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CircleUser className="w-5 h-5 text-neutral-500" />
                        <h2 className="text-lg font-medium">My Bio</h2>
                      </div>
                      <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                    </DisclosureButton>
                    <DisclosurePanel className="px-6 pb-6">
                      {profile && (
                        <div>
                          <BioView profile={profile} />
                          <div className="mt-4">
                            <button
                              onClick={handleOpenBio}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              Edit Bio
                            </button>
                          </div>
                        </div>
                      )}
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            </div>

            {/* Favourites */}
            <div id="favourites-section">
              <Disclosure>
                {({ open }) => (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                    <DisclosureButton className="w-full px-4 py-4 text-left flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-neutral-500" />
                        <span className="text-lg font-medium">My Favourites</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="px-6 pb-6">
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
                                  className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 space-y-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                                  onClick={() => !isInactive && navigate(`/agistments/${favourite.id}`)}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-grow">
                                      <div>
                                        <h3 className="font-medium">{favourite.name}</h3>
                                        <p className="text-sm text-neutral-600">{favourite.location.suburb}, {favourite.location.state}</p>
                                        {(favourite.status === 'HIDDEN' || favourite.status === 'REMOVED') && (
                                          <span className="chip-unavailable mt-2">
                                            {favourite.status === 'HIDDEN' ? 'Hidden' : 'Removed'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Menu as="div" className="relative">
                                      {({ open }) => {
                                        const buttonRef = useRef<HTMLButtonElement>(null);
                                        const [showAbove, setShowAbove] = useState(false);

                                        useEffect(() => {
                                          if (open && buttonRef.current) {
                                            const buttonRect = buttonRef.current.getBoundingClientRect();
                                            const windowHeight = window.innerHeight;
                                            const spaceBelow = windowHeight - buttonRect.bottom;
                                            setShowAbove(spaceBelow < 200); // Menu height + buffer
                                          }
                                        }, [open]);

                                        return (
                                          <div>
                                            <Menu.Button 
                                              ref={buttonRef}
                                              className="p-3 -m-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <MoreVertical className="w-5 h-5 text-neutral-400" />
                                            </Menu.Button>
                                            <Transition
                                              show={open}
                                              enter="transition ease-out duration-100"
                                              enterFrom="transform opacity-0 scale-95"
                                              enterTo="transform opacity-100 scale-100"
                                              leave="transition ease-in duration-75"
                                              leaveFrom="transform opacity-100 scale-100"
                                              leaveTo="transform opacity-0 scale-95"
                                            >
                                              <Menu.Items 
                                                className={`absolute ${showAbove ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]`}
                                              >
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <button
                                                      className={`${
                                                        active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                      } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle edit
                                                      }}
                                                    >
                                                      <Pencil className="w-4 h-4 mr-3 text-neutral-400" />
                                                      Edit
                                                    </button>
                                                  )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <button
                                                      className={`${
                                                        active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                      } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFavorite(favourite.id, e);
                                                      }}
                                                    >
                                                      <Trash2 className="w-4 h-4 mr-3" />
                                                      Delete
                                                    </button>
                                                  )}
                                                </Menu.Item>
                                              </Menu.Items>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Menu>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            </div>

            {/* Saved Searches */}
            <div id="saved-searches-section">
              <Disclosure defaultOpen={searchParams.get('section') === 'saved-searches'}>
                {({ open }) => (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                    <DisclosureButton className="w-full px-4 py-4 text-left flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-neutral-500" />
                        <span className="text-lg font-medium">Saved Searches</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="px-6 pb-6">
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
                                  onClick={() => navigate(`/agistments?q=${search.searchHash}`)}
                                >
                                  <div className="flex items-center">
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
                                    <Menu as="div" className="relative">
                                      {({ open }) => {
                                        const buttonRef = useRef<HTMLButtonElement>(null);
                                        const [showAbove, setShowAbove] = useState(false);

                                        useEffect(() => {
                                          if (open && buttonRef.current) {
                                            const buttonRect = buttonRef.current.getBoundingClientRect();
                                            const windowHeight = window.innerHeight;
                                            const spaceBelow = windowHeight - buttonRect.bottom;
                                            setShowAbove(spaceBelow < 200); // Menu height + buffer
                                          }
                                        }, [open]);

                                        return (
                                          <div>
                                            <Menu.Button 
                                              ref={buttonRef}
                                              className="p-3 -m-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <MoreVertical className="w-5 h-5 text-neutral-400" />
                                            </Menu.Button>
                                            <Transition
                                              show={open}
                                              enter="transition ease-out duration-100"
                                              enterFrom="transform opacity-0 scale-95"
                                              enterTo="transform opacity-100 scale-100"
                                              leave="transition ease-in duration-75"
                                              leaveFrom="transform opacity-100 scale-100"
                                              leaveTo="transform opacity-0 scale-95"
                                            >
                                              <Menu.Items 
                                                className={`absolute ${showAbove ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]`}
                                              >
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <button
                                                      className={`${
                                                        active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                      } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingSearch(search);
                                                        setShowSaveSearchModal(true);
                                                      }}
                                                    >
                                                      <Pencil className="w-4 h-4 mr-3 text-neutral-400" />
                                                      Edit
                                                    </button>
                                                  )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <button
                                                      className={`${
                                                        active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                                      } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSearch(search.id, e);
                                                      }}
                                                    >
                                                      <Trash2 className="w-4 h-4 mr-3" />
                                                      Delete
                                                    </button>
                                                  )}
                                                </Menu.Item>
                                              </Menu.Items>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Menu>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            </div>

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
          <Bio isOpen={isBioOpenState} onClose={handleCloseBio} />

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
