import React, { useState, useEffect } from 'react';
import { Share2Icon, Star, PencilIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { profileService } from '../../services/profile.service';
import { useNavigate } from 'react-router-dom';

interface ShareFavoriteButtonsProps {
  agistmentId: string;
  shareDescription: string;
  onShare?: () => void;
  onFavorite?: () => void;
  onEdit?: () => void;
  onToggleVisibility?: (newVisibility: boolean) => void;
  hideShare?: boolean;
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
  showVisibility = false,
  isVisible = true,
}) => {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(() => {
    const initialState = profile?.favourites?.some((fav) => fav.agistmentId === agistmentId) || false;
    console.log('Initial favorite state:', { agistmentId, initialState, favorites: profile?.favourites });
    return initialState;
  });

  const isMyAgistment = profile?.myAgistments?.includes(agistmentId) || false;

  useEffect(() => {
    const newState = profile?.favourites?.some((fav) => fav.agistmentId === agistmentId) || false;
    console.log('Profile changed:', { 
      agistmentId, 
      newState, 
      favorites: profile?.favourites,
      currentState: isFavorited 
    });
    setIsFavorited(newState);
  }, [profile, agistmentId]);

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
      console.log('No profile found when trying to favorite');
      alert('Please login to favorite properties');
      return;
    }
    const newState = !isFavorited;
    console.log('Favorite clicked:', { 
      agistmentId, 
      newState, 
      currentFavorites: profile.favourites 
    });

    try {
      let newFavorites;
      if (newState) {
        // Add to favorites
        newFavorites = [...profile.favourites, { agistmentId, lastUpdate: new Date().toISOString() }];
      } else {
        // Remove from favorites
        newFavorites = profile.favourites.filter(fav => fav.agistmentId !== agistmentId);
      }

      await profileService.updateProfile({
        ...profile,
        favourites: newFavorites
      });

      setIsFavorited(newState);
      onFavorite?.();
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agistments/${agistmentId}/edit`);
    onEdit?.();
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility?.(!isVisible);
  };

  return (
    <div className={`flex items-center ${hideShare ? '-ml-2' : ''}`}>
      {!hideShare && (
        <button
          type="button"
          onClick={handleShare}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <Share2Icon className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        onClick={handleFavorite}
        className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-colors"
      >
        <Star 
          className={`h-5 w-5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'fill-none'}`} 
        />
      </button>
      {isMyAgistment && (
        <button
          type="button"
          onClick={handleEdit}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      )}
      {showVisibility && isMyAgistment && (
        <button
          type="button"
          onClick={handleToggleVisibility}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          {isVisible ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeOffIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};
