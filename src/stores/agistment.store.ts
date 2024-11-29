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
  subscribe: (listener: (state: AgistmentState) => void) => () => void;
  destroy: () => void;
}

// Create a single store with two slices
export const useAgistmentStore = create<AgistmentState>()(
  persist(
    (set, get) => ({
      tempAgistments: {},
      tempAgistmentTexts: {},
      cachedAgistments: {},
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
      getTempAgistment: (id: string) => get().tempAgistments[id] || null,
      getTempAgistmentText: (id: string) => get().tempAgistmentTexts[id] || null,
      removeTempAgistment: (id: string) =>
        set((state) => {
          const { [id]: _, ...rest } = state.tempAgistments;
          const { [id]: __, ...textRest } = state.tempAgistmentTexts;
          return {
            tempAgistments: rest,
            tempAgistmentTexts: textRest
          };
        }),
      setCachedAgistment: (id: string, agistment: Agistment | null) =>
        set((state) => ({
          cachedAgistments: {
            ...state.cachedAgistments,
            [id]: agistment
          }
        })),
      getCachedAgistment: (id: string) => get().cachedAgistments[id] || null,
      removeCachedAgistment: (id: string) =>
        set((state) => {
          const { [id]: _, ...rest } = state.cachedAgistments;
          return {
            cachedAgistments: rest
          };
        }),
      subscribe: (listener) => {
        const unsubscribe = get().subscribe(listener);
        return () => unsubscribe();
      },
      destroy: () => {
        get().destroy();
      }
    }),
    {
      name: 'cached-agistment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cachedAgistments: state.cachedAgistments
      })
    }
  )
);
