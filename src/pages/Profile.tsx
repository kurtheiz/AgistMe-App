import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SavedSearch } from '../types/profile';
import { SaveSearchModal } from '../components/Search/SaveSearchModal';
import { BioPanel } from '../components/Profile/BioPanel';
import BioModal from '../components/Profile/BioModal';
import { FavoritesPanel } from '../components/Profile/FavoritesPanel';
import { SavedSearchesPanel } from '../components/Profile/SavedSearchesPanel';
import { useBioStore } from '../stores/bio.store';
import { useFavoritesStore } from '../stores/favorites.store';
import { useSavedSearchesStore } from '../stores/savedSearches.store';
import { useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { useAgistor } from '../hooks/useAgistor';

export default function Profile() {
  const { isSignedIn } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [saveSearchCriteria, setSaveSearchCriteria] = useState<any>(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use Zustand stores instead of local state
  const { bio, isLoading: isBioLoading } = useBioStore();
  const { favorites, isLoading: isFavoritesLoading } = useFavoritesStore();
  const { savedSearches, isLoading: isSavedSearchesLoading } = useSavedSearchesStore();
  const { isAgistor } = useAgistor();

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const isLoading = isBioLoading || isFavoritesLoading || isSavedSearchesLoading;

  const handleDeleteSavedSearch = async (searchId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await useSavedSearchesStore.getState().deleteSavedSearch(searchId, queryClient);
    } catch (error) {
      console.error('Error in handleDeleteSavedSearch:', error);
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
    setIsBioModalOpen(true);
  };

  const handleEditSearch = async (name: string, enableNotifications: boolean) => {
    try {
      if (!editingSearch) return;
      
      await useSavedSearchesStore.getState().saveSearch(
        name,
        editingSearch.searchCriteria,
        enableNotifications,
        editingSearch.id,
        queryClient
      );
      setShowSaveSearchModal(false);
      setEditingSearch(null);
    } catch (error) {
      console.error('Failed to update search:', error);
    }
  };

  const handleSaveNewSearch = async (name: string, enableNotifications: boolean) => {
    try {
      if (!saveSearchCriteria) return;
      
      await useSavedSearchesStore.getState().saveSearch(
        name,
        saveSearchCriteria,
        enableNotifications,
        undefined,
        queryClient
      );
      setShowSaveSearchModal(false);
      setSaveSearchCriteria(null);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleDeleteFavorite = async (favoriteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorite = favorites.find(f => f.id === favoriteId);
    if (!favorite) return;

    try {
      await useFavoritesStore.getState().toggleFavorite(favoriteId, favorite, queryClient);
    } catch (error) {
      // Error is already handled in the store
      console.error('Error in handleDeleteFavorite:', error);
    }
  };

  const handleSavedSearchEdit = (search: SavedSearch) => {
    setShowSaveSearchModal(true);
    setSaveSearchCriteria(search.searchCriteria);
  };

  const handleBioModalClose = async () => {
    setIsBioModalOpen(false);
    // Refresh profile data
    // try {
    //   const profileData = await profileService.getProfile();
    //   setProfile(profileData);
    // } catch (error) {
    //   console.error('Error refreshing profile:', error);
    //   toast.error('Failed to refresh profile data');
    // }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteProfile();
      await signOut();
      navigate('/');
      toast.success('Your account has been deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    }
  };

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

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600">Account Type:</span>
            <span className="text-sm font-medium text-primary-600">
              {isAgistor ? 'Agistor' : 'Horse Owner'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <BioPanel 
              profile={bio} 
              onEditClick={handleOpenBio} 
              isDefaultOpen={false}
            />
            <BioModal 
              isOpen={isBioModalOpen}
              onClose={handleBioModalClose}
              profile={bio}
            />
            <FavoritesPanel
              onNavigate={(id) => navigate(`/agistments/${id}`)}
              onDelete={handleDeleteFavorite}
              isDefaultOpen={false}
            />

            <SavedSearchesPanel
              savedSearches={savedSearches}
              isLoading={isLoading}
              isDefaultOpen={false}
              onNavigate={(searchHash: string) => navigate(`/agistments?q=${searchHash}`)}
              onEdit={(search) => {
                setEditingSearch(search);
                handleSavedSearchEdit(search);
              }}
              onDelete={handleDeleteSavedSearch}
            />

          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="mt-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => {
          setShowSaveSearchModal(false);
          setEditingSearch(null);
          setSaveSearchCriteria(null);
        }}
        searchCriteria={saveSearchCriteria}
        existingId={editingSearch?.id}
        initialName={editingSearch?.name || ''}
        initialNotifications={editingSearch?.enableNotifications || false}
        title={editingSearch ? 'Edit Search' : 'Save Search'}
        onSave={editingSearch ? handleEditSearch : handleSaveNewSearch}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message={`Are you sure you want to delete your account? This action cannot be undone.

The following data will be permanently deleted:

• All your saved searches and search notifications
• All your favorited agistments
${isAgistor ? '• All your listed agistments and their associated data\n' : ''}• Your profile information and preferences

This action is permanent and cannot be reversed.`}
        confirmText="Delete Account"
        cancelText="Cancel"
      />
    </div>
  );
}
