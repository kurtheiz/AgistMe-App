import { create } from 'zustand';
import { profileService } from '../services/profile.service';
import { SavedSearch } from '../types/profile';
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { SearchRequest } from '../types/search';

interface SavedSearchesState {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  setSavedSearches: (searches: SavedSearch[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  deleteSavedSearch: (searchId: string, queryClient?: QueryClient) => Promise<void>;
  saveSearch: (name: string, searchCriteria: SearchRequest, enableNotifications: boolean, existingId?: string, queryClient?: QueryClient) => Promise<void>;
}

export const useSavedSearchesStore = create<SavedSearchesState>((set, get) => ({
  savedSearches: [],
  isLoading: false,
  setSavedSearches: (searches) => set({ savedSearches: searches }),
  setIsLoading: (isLoading) => set({ isLoading }),
  deleteSavedSearch: async (searchId: string, queryClient?: QueryClient) => {
    try {
      // First update local state
      const currentSearches = get().savedSearches;
      const updatedSearches = currentSearches.filter(search => search.id !== searchId);
      set({ savedSearches: updatedSearches });

      // Then update the backend
      await profileService.updateSavedSearches(updatedSearches);

      // Update TanStack Query cache if queryClient is provided
      if (queryClient) {
        queryClient.setQueryData(['profile'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            savedSearches: updatedSearches
          };
        });
      }

      toast.success('Search deleted successfully');
    } catch (error) {
      // Revert local state on error
      const currentSearches = get().savedSearches;
      set({ savedSearches: currentSearches });
      toast.error('Failed to delete search');
      throw error;
    }
  },
  saveSearch: async (name: string, searchCriteria: SearchRequest, enableNotifications: boolean, existingId?: string, queryClient?: QueryClient) => {
    try {
      const currentSearches = get().savedSearches;
      const now = new Date().toISOString();
      const newSearch: SavedSearch = {
        id: existingId || crypto.randomUUID(),
        name,
        searchHash: searchCriteria.searchHash,
        lastUpdate: now,
        enableNotifications
      };

      let updatedSearches: SavedSearch[];
      if (existingId) {
        // Update existing search
        updatedSearches = currentSearches.map(search => 
          search.id === existingId ? newSearch : search
        );
      } else {
        // Add new search
        updatedSearches = [...currentSearches, newSearch];
      }

      // Update local state
      set({ savedSearches: updatedSearches });

      // Update backend
      await profileService.updateSavedSearches(updatedSearches);

      // Update TanStack Query cache if queryClient is provided
      if (queryClient) {
        queryClient.setQueryData(['profile'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            savedSearches: updatedSearches
          };
        });
      }

      toast.success(existingId ? 'Search updated successfully' : 'Search saved successfully');
    } catch (error) {
      // Revert local state on error
      const currentSearches = get().savedSearches;
      set({ savedSearches: currentSearches });
      toast.error(existingId ? 'Failed to update search' : 'Failed to save search');
      throw error;
    }
  }
}));
