import { create } from 'zustand';

interface SearchStore {
  isSearchModalOpen: boolean;
  scrollPosition: number;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setScrollPosition: (position: number) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isSearchModalOpen: false,
  scrollPosition: 0,
  setIsSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
  setScrollPosition: (position) => set({ scrollPosition: position })
}));
