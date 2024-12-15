import { create } from 'zustand';

export interface Bio {
  description?: string;
  location?: string;
  preferences?: Record<string, any>;
}

interface BioState {
  bio: Bio | null;
  isLoading: boolean;
  setBio: (bio: Bio) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useBioStore = create<BioState>((set) => ({
  bio: null,
  isLoading: false,
  setBio: (bio) => set({ bio }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
