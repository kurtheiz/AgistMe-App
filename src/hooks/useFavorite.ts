import { useState, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import { useAuth } from '@clerk/clerk-react';
import { AgistmentResponse } from '../types/agistment';
import toast from 'react-hot-toast';

export function useFavorite(agistment: AgistmentResponse) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const toggleFavorite = useCallback(async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to save favorites');
      return;
    }

    if (!agistment) {
      return;
    }

    try {
      setIsLoading(true);
      const newStatus = await profileService.toggleFavorite(agistment.id, agistment.isFavourite || false);
      agistment.isFavourite = newStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  }, [agistment, isSignedIn]);

  return {
    isFavorite: agistment?.isFavourite || false,
    isLoading,
    toggleFavorite
  };
}
