import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Agistment } from '../types/agistment';

// Combined state interface
interface AgistmentState {
  tempAgistments: Record<string, Agistment | null>;
  tempAgistmentTexts: Record<string, string | null>;
  cachedAgistments: Record<string, Agistment | null>;
  setTempAgistment: (id: string, agistment: Agistment | null) => void;
  setTempAgistmentText: (id: string, text: string | null) => void;
  getTempAgistment: (id: string) => Agistment | null;
  getTempAgistmentText: (id: string) => string | null;
  removeTempAgistment: (id: string) => void;
  setCachedAgistment: (id: string, agistment: Agistment | null) => void;
  getCachedAgistment: (id: string) => Agistment | null;
  removeCachedAgistment: (id: string) => void;
}

// Create a single store with two slices
export const useAgistmentStore = create<AgistmentState>()(
  (set, get) => {
    // Create the non-persisted part
    const nonPersistedSlice = {
      tempAgistments: {},
      tempAgistmentTexts: {},
      setTempAgistment: (id: string, agistment: Agistment | null) => 
        set((state) => ({
          tempAgistments: {
            ...state.tempAgistments,
            [id]: agistment
          }
        })),
      setTempAgistmentText: (id: string, text: string | null) =>
        set((state) => ({
          tempAgistmentTexts: {
            ...state.tempAgistmentTexts,
            [id]: text
          }
        })),
      getTempAgistment: (id: string) => {
        const state = get();
        return state.tempAgistments[id] || null;
      },
      getTempAgistmentText: (id: string) => {
        const state = get();
        return state.tempAgistmentTexts[id] || null;
      },
      removeTempAgistment: (id: string) =>
        set((state) => {
          const { [id]: _, ...remainingAgistments } = state.tempAgistments;
          const { [id]: __, ...remainingTexts } = state.tempAgistmentTexts;
          return {
            ...state,
            tempAgistments: remainingAgistments,
            tempAgistmentTexts: remainingTexts
          };
        }),
    };

    // Create the persisted part
    const persistedSlice = persist(
      () => ({
        cachedAgistments: {},
        setCachedAgistment: (id: string, agistment: Agistment | null) =>
          set((state) => ({
            ...state,
            cachedAgistments: {
              ...state.cachedAgistments,
              [id]: agistment
            }
          })),
        getCachedAgistment: (id: string) => {
          const state = get();
          return state.cachedAgistments[id] || null;
        },
        removeCachedAgistment: (id: string) =>
          set((state) => {
            const { [id]: _, ...remainingAgistments } = state.cachedAgistments;
            return {
              ...state,
              cachedAgistments: remainingAgistments
            };
          }),
      }),
      {
        name: 'cached-agistment-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ cachedAgistments: state.cachedAgistments })
      }
    );

    // Combine both slices
    return {
      ...nonPersistedSlice,
      ...persistedSlice(set, get, {})
    };
  }
);
