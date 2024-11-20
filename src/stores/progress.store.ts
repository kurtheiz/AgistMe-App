import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  pendingRequests: number;
  loadingTimeout: number | null;
  increment: () => void;
  decrement: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  isLoading: false,
  pendingRequests: 0,
  loadingTimeout: null,
  increment: () => {
    const state = get();
    if (state.loadingTimeout) {
      clearTimeout(state.loadingTimeout);
    }
    
    set((state) => ({
      pendingRequests: state.pendingRequests + 1,
      loadingTimeout: window.setTimeout(() => {
        set({ isLoading: true, loadingTimeout: null });
      }, 300) // Only show loading after 300ms
    }));
  },
  decrement: () => {
    const state = get();
    if (state.loadingTimeout) {
      clearTimeout(state.loadingTimeout);
    }
    
    set((state) => ({
      pendingRequests: Math.max(0, state.pendingRequests - 1),
      isLoading: state.pendingRequests > 1,
      loadingTimeout: null
    }));
  },
}));
