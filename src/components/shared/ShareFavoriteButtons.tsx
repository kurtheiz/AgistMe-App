import React, { useState, useEffect } from 'react';
import { Share2, Star, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react';

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
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const favorites = user.publicMetadata.favorites as { agistmentId: string }[] || [];
      setIsFavorited(favorites.some((fav) => fav.agistmentId === agistmentId) || false);
    }
  }, [user?.publicMetadata.favorites, agistmentId]);

  const isMyAgistment = user?.publicMetadata.myAgistments?.includes(agistmentId) || false;

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
      const url = `${window.location.origin}/agistments/${agistmentId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      onShare?.();
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) {
      toast.error('Please sign in to favorite properties');
      return;
    }

    if (isUpdatingFavorite) return;

    try {
      setIsUpdatingFavorite(true);
      const currentFavorites = user?.publicMetadata.favorites as { agistmentId: string }[] || [];
      
      let newFavorites;
      if (isFavorited) {
        newFavorites = currentFavorites.filter(fav => fav.agistmentId !== agistmentId);
      } else {
        newFavorites = [...currentFavorites, { agistmentId }];
      }

      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          favorites: newFavorites
        }
      });

      setIsFavorited(!isFavorited);
      onFavorite?.();
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agistments/${agistmentId}/edit`);
    onEdit?.();
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {!hideShare && (
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={handleFavorite}
        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          className={`w-5 h-5 ${isFavorited ? 'fill-yellow-400 stroke-yellow-400' : ''}`}
        />
      </button>
      {!hideEdit && isMyAgistment && (
        <button
          onClick={handleEdit}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Edit"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
