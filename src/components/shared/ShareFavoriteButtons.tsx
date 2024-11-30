import React, { useState } from 'react';
import { Share2Icon, StarIcon } from 'lucide-react';
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 touch-none"
      >
        <Share2Icon className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={handleFavorite}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 touch-none"
      >
        <StarIcon className={`h-6 w-6 ${isFavorited ? 'fill-current text-yellow-400' : ''}`} />
      </button>
    </div>
  );
};
