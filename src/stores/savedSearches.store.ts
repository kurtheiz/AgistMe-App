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
      const currentSearches = get().savedSearches;
      const updatedSearches = currentSearches.filter(search => search.id !== searchId);
      set({ savedSearches: updatedSearches });
      await profileService.updateSavedSearches(updatedSearches);

      if (queryClient) {
        queryClient.setQueryData(['profile'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            savedSearches: updatedSearches
          };
        });
      }

      toast.success('Search deleted');
    } catch (error) {
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

      if (existingId) {
        // Update existing search
        const updatedSearches = currentSearches.map(search => 
          search.id === existingId 
            ? { ...search, name, enableNotifications, lastUpdate: now }
            : search
        );
        set({ savedSearches: updatedSearches });
        await profileService.updateSavedSearches(updatedSearches);
      } else {
        // Add new search
        const newSearch: SavedSearch = {
          id: crypto.randomUUID(),
          name,
          searchCriteria,
          lastUpdate: now,
          enableNotifications
        };
        const updatedSearches = [...currentSearches, newSearch];
        set({ savedSearches: updatedSearches });
        await profileService.updateSavedSearches(updatedSearches);
      }

      if (queryClient) {
        queryClient.setQueryData(['profile'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            savedSearches: get().savedSearches
          };
        });
      }

      toast.success(existingId ? 'Search updated successfully' : 'Search saved successfully');
    } catch (error) {
      toast.error(existingId ? 'Failed to update search' : 'Failed to save search');
      throw error;
    }
  }
}));
