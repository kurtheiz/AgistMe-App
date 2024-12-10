import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { SavedSearch, Profile as ProfileType } from '../types/profile';
import { Favourite } from '../types/profile';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { useNotificationsStore } from '../stores/notifications.store';
import { NotificationsPanel } from '../components/profile/NotificationsPanel';
import { BioPanel } from '../components/profile/BioPanel';
import { FavoritesPanel } from '../components/profile/FavoritesPanel';
import { SavedSearchesPanel } from '../components/profile/SavedSearchesPanel';

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
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      if (!notification.read) {
        updateNotification(notificationId, { read: true });
        
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        
        await profileService.updateNotifications(updatedNotifications);
      }

      if (notification.agistmentId) {
        navigate(`/agistments/${notification.agistmentId}`);
      } else if (notification.searchId) {
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

      updateNotification(notificationId, { read: !notification.read });

      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: !n.read } : n
      );

      await profileService.updateNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
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
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <NotificationsPanel
          notifications={notifications}
          isLoading={isLoadingNotifications}
          onNotificationClick={handleNotificationClick}
          onToggleRead={handleToggleRead}
          onDelete={handleDeleteNotification}
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <BioPanel
              profile={profile}
              onEditClick={handleOpenBio}
            />

            <FavoritesPanel
              favourites={favourites}
              isLoading={isLoadingFavourites}
              onNavigate={(id) => navigate(`/agistments/${id}`)}
              onDelete={handleDeleteFavorite}
            />

            <SavedSearchesPanel
              savedSearches={savedSearches}
              isLoading={isLoading}
              isDefaultOpen={searchParams.get('section') === 'saved-searches'}
              onNavigate={(searchHash) => navigate(`/agistments?q=${searchHash}`)}
              onEdit={(search) => {
                setEditingSearch(search);
                setShowSaveSearchModal(true);
              }}
              onDelete={handleDeleteSearch}
            />
          </div>
        </div>
      </div>

      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => {
          setShowSaveSearchModal(false);
          setEditingSearch(null);
        }}
        onSave={handleEditSearch}
        initialName={editingSearch?.name}
        initialEnableNotifications={editingSearch?.enableNotifications}
      />
    </div>
  );
}
