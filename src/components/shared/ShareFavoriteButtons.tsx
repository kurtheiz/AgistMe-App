import React, { useState } from 'react';
import { Share2Icon, Star } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

interface ShareFavoriteButtonsProps {
  agistmentId: string;
  shareDescription: string;
  onShare?: () => void;
  onFavorite?: () => void;
  hideShare?: boolean;
}

export const ShareFavoriteButtons: React.FC<ShareFavoriteButtonsProps> = ({
  agistmentId,
  shareDescription,
  onShare,
  onFavorite,
  hideShare = false,
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
          className={`h-5 w-5 ${isFavorited ? 'fill-current text-yellow-400' : ''}`} 
        />
      </button>
    </div>
  );
};
