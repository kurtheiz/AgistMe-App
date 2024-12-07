import { create } from 'zustand';

interface SearchStore {
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (isOpen: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isSearchModalOpen: false,
  setIsSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
}));
