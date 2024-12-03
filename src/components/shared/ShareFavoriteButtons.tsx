import React, { useState, useEffect } from 'react';
import { Share2Icon, Star, PencilIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

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
  onToggleVisibility,
  hideShare = false,
  hideEdit = false,
  showVisibility = false,
  isVisible = true,
}) => {
  const { profile, updateProfileData } = useProfile();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

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
          url: `${window.location.origin}/agistment/${agistmentId}`,
        });
        onShare?.();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      // Copy to clipboard instead
      const shareUrl = `${window.location.origin}/agistment/${agistmentId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) {
      alert('Please login to favorite properties');
      return;
    }

    try {
      const newState = !isFavorited;
      const newFavorites = newState
        ? [...(profile.favourites || []), { agistmentId, lastUpdate: new Date().toISOString() }]
        : (profile.favourites || []).filter(fav => fav.agistmentId !== agistmentId);

      // Optimistically update UI
      setIsFavorited(newState);

      // Remove fields that shouldn't be sent in update
      const { id, email, lastUpdate, ...updateData } = profile;
      
      // Update profile using context
      await updateProfileData({
        ...updateData,
        favourites: newFavorites
      });

      onFavorite?.();
    } catch (error) {
      // Revert UI state on error
      setIsFavorited(!isFavorited);
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites. Please try again.');
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

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility?.(!isVisible);
  };

  return (
    <div className="flex items-center gap-2">
      {!hideShare && (
        <button
          onClick={handleShare}
          className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Share2Icon className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={handleFavorite}
        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Star
          className={`w-5 h-5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`}
        />
      </button>
      {!hideEdit && isMyAgistment && (
        <button
          onClick={handleEdit}
          className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      )}
      {showVisibility && isMyAgistment && (
        <button
          onClick={handleToggleVisibility}
          className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {isVisible ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeOffIcon className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};
