import { useState, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import { useAuth } from '@clerk/clerk-react';
import { AgistmentResponse } from '../types/agistment';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '../stores/favorites.store';

export function useFavorite(agistment: AgistmentResponse) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { favorites, setFavorites } = useFavoritesStore();

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
      
      // Update the agistment's favorite status
      agistment.isFavourite = newStatus;

      // Update Zustand favorites store
      if (newStatus) {
        // Add to favorites
        setFavorites([...favorites, {
          id: agistment.id,
          name: agistment.basicInfo.name,
          location: {
            suburb: agistment.propertyLocation.location.suburb,
            state: agistment.propertyLocation.location.state,
            address: agistment.propertyLocation.location.address,
            postcode: agistment.propertyLocation.location.postcode,
            region: agistment.propertyLocation.location.region
          },
          status: agistment.status,
          lastUpdate: new Date().toISOString(),
          photo: agistment.photoGallery?.photos?.[0]?.link || ''
        }]);
      } else {
        // Remove from favorites
        setFavorites(favorites.filter(fav => fav.id !== agistment.id));
      }

      // Update TanStack Query cache
      queryClient.setQueriesData({ queryKey: ['agistments'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            results: page.results.map((result: AgistmentResponse) => 
              result.id === agistment.id 
                ? { ...result, isFavourite: newStatus }
                : result
            )
          }))
        };
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  }, [agistment, isSignedIn, queryClient, favorites, setFavorites]);

  return {
    isFavorite: agistment?.isFavourite || false,
    isLoading,
    toggleFavorite
  };
}
