import { create } from 'zustand';
import { Favourite } from '../types/profile';
import { profileService } from '../services/profile.service';
import { toast } from 'react-hot-toast';
import { QueryClient } from '@tanstack/react-query';
import { AgistmentResponse } from '../types/agistment';

interface FavoritesState {
  favorites: Favourite[];
  isLoading: boolean;
  setFavorites: (favorites: Favourite[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleFavorite: (agistmentId: string, favorite: Favourite, queryClient?: QueryClient) => Promise<void>;
  fetchFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  setFavorites: (favorites) => set({ favorites }),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchFavorites: async () => {
    const { isLoading } = get();
    
    // Don't fetch if already loading
    if (isLoading) {
      return;
    }

    set({ isLoading: true });
    try {
      const response = await profileService.getFavourites();
      set({ favorites: Array.isArray(response) ? response : response.favourites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (agistmentId: string, favorite: Favourite, queryClient?: QueryClient) => {
    const { favorites } = get();
    const isFavorited = favorites.some(fav => fav.id === agistmentId);
    
    try {
      const newStatus = await profileService.toggleFavorite(agistmentId, isFavorited);
      
      // Update TanStack Query cache for agistments if queryClient is provided
      if (queryClient) {
        queryClient.setQueriesData({ queryKey: ['agistments'] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              results: page.results.map((result: AgistmentResponse) => 
                result.id === agistmentId 
                  ? { ...result, isFavourite: newStatus }
                  : result
              )
            }))
          };
        });
      }

      if (newStatus) {
        // Add to favorites
        set((state) => ({
          favorites: [...state.favorites, favorite]
        }));
        toast.success('Added to favorites');
      } else {
        // Remove from favorites
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.id !== agistmentId)
        }));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
      toast.error('Failed to update favourite');
    }
  }
}));
