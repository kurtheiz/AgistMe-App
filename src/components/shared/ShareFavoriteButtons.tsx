import React, { useState, useEffect } from 'react';
import { Share2, Star, Pencil } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ShareFavoriteButtonsProps {
  agistmentId: string;
  shareDescription: string;
  onShare?: () => void;
  onFavorite?: () => void;
  onEdit?: () => void;
  onToggleVisibility?: (newVisibility: boolean) => void;
  hideShare?: boolean;
  hideEdit?: boolean;
  showVisibility?: boolean;
  isVisible?: boolean;
}

export const ShareFavoriteButtons: React.FC<ShareFavoriteButtonsProps> = ({
  agistmentId,
  shareDescription,
  onShare,
  onFavorite,
  onEdit,
  hideShare = false,
  hideEdit = false,
}) => {
  const { profile, updateProfileData, loading } = useProfile();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    setIsFavorited(profile?.favourites?.some((fav) => fav.agistmentId === agistmentId) || false);
  }, [profile?.favourites, agistmentId]);

  const isMyAgistment = profile?.myAgistments?.includes(agistmentId) || false;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgistMe Property',
          text: shareDescription,
          url: `${window.location.origin}/agistments/${agistmentId}`,
        });
        onShare?.();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      // Copy to clipboard instead
      const shareUrl = `${window.location.origin}/agistments/${agistmentId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('1. Favorite clicked with agistmentId:', agistmentId);
    console.log('Current profile:', profile);

    if (!profile) {
      toast.error('Please sign in to favorite properties');
      return;
    }

    if (isUpdatingFavorite) {
      console.log('Already updating favorite, skipping');
      return;
    }

    setIsUpdatingFavorite(true);

    try {
      const newState = !isFavorited;
      console.log('2. Current favorite state:', isFavorited);
      console.log('3. New favorite state will be:', newState);

      const favoriteItem = { agistmentId, lastUpdate: new Date().toISOString() };
      console.log('4. Created favorite item:', favoriteItem);
      
      // Create a new profile object with updated favorites
      const updatedProfile = {
        ...profile,
        favourites: newState
          ? [...(profile.favourites || []), favoriteItem]
          : (profile.favourites || []).filter(fav => fav.agistmentId !== agistmentId)
      };
      console.log('5. Updated profile object:', updatedProfile);

      // Remove fields that shouldn't be sent in update
      const { id, email, lastUpdate, ...updateData } = updatedProfile;
      console.log('6. Data to be sent to API:', updateData);
      
      // Update profile using context with all fields
      console.log('7. Calling updateProfileData...');
      await updateProfileData(updateData);
      console.log('8. Profile update successful');

      // Only update UI after successful API call
      setIsFavorited(newState);
      toast.success(newState ? 'Added to favorites' : 'Removed from favorites');
      onFavorite?.();
    } catch (error) {
      console.error('Error updating favorites:', error, {
        agistmentId,
        profile,
        isFavorited
      });
      toast.error('Failed to update favorites. Please try again.');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/agistments/${agistmentId}/edit`);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${hideShare ? 'justify-start' : ''}`}>
      <button
        onClick={handleFavorite}
        disabled={loading || isUpdatingFavorite}
        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
      >
        <Star
          className={`w-5 h-5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`}
        />
      </button>
      {!hideShare && (
        <button
          onClick={handleShare}
          className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}
      {!hideEdit && isMyAgistment && (
        <button
          onClick={handleEdit}
          className="button-toolbar"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </button>
      )}
    </div>
  );
};
