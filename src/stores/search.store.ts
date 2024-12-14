import { create } from 'zustand';
import { SearchResponse } from '../types/search';

interface ScrollState {
  [key: string]: number;  // location key -> scroll position
}

interface SearchStore {
  isSearchModalOpen: boolean;
  searchResponse: SearchResponse | null;
  searchHash: string;
  scrollPositions: ScrollState;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setSearchResponse: (response: SearchResponse | null) => void;
  setSearchHash: (hash: string) => void;
  appendResults: (response: SearchResponse) => void;
  saveScrollPosition: (locationKey: string, position: number) => void;
  getScrollPosition: (locationKey: string) => number | undefined;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  isSearchModalOpen: false,
  searchResponse: null,
  searchHash: '',
  scrollPositions: {},
  setIsSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
  setSearchResponse: (response) => set({ searchResponse: response }),
  setSearchHash: (hash) => set({ searchHash: hash }),
  appendResults: (response) => set((state) => ({
    searchResponse: state.searchResponse ? {
      ...response,
      results: [...state.searchResponse.results, ...response.results]
    } : response
  })),
  saveScrollPosition: (locationKey, position) => set((state) => ({
    scrollPositions: {
      ...state.scrollPositions,
      [locationKey]: position
    }
  })),
  getScrollPosition: (locationKey) => get().scrollPositions[locationKey],
  reset: () => set({ searchResponse: null, searchHash: '', scrollPositions: {} })
}));
