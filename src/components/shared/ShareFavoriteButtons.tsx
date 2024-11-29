import React, { useState } from 'react';
import { ShareIcon, FavouriteIcon } from '../Icons';
import { useProfile } from '../../context/ProfileContext';

interface ShareFavoriteButtonsProps {
  agistmentId: string;
  shareDescription: string;
  onShare?: () => void;
  onFavorite?: () => void;
}

export const ShareFavoriteButtons: React.FC<ShareFavoriteButtonsProps> = ({
  agistmentId,
  shareDescription,
  onShare,
  onFavorite,
}) => {
  const { profile } = useProfile();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleShare = async () => {
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

  const handleFavorite = () => {
    if (!profile) {
      alert('Please login to favorite properties');
      return;
    }
    setIsFavorited(!isFavorited);
    onFavorite?.();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        title="Share this property"
      >
        <ShareIcon className="w-5 h-5" />
        <span className="text-sm">Share</span>
      </button>
      <button
        onClick={handleFavorite}
        className={`inline-flex items-center gap-1 transition-colors ${
          isFavorited
            ? 'text-red-500 dark:text-red-400'
            : 'text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
        }`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FavouriteIcon className="w-5 h-5" />
        <span className="text-sm">Favorite</span>
      </button>
    </div>
  );
};
