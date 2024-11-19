import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReferenceData } from '../types/reference';

interface ReferenceStore {
  referenceData: ReferenceData[] | null;
  isLoading: boolean;
  error: string | null;
  setReferenceData: (data: ReferenceData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReferenceStore = create<ReferenceStore>()(
  persist(
    (set) => ({
      referenceData: null,
      isLoading: false,
      error: null,
      setReferenceData: (data) => {
        console.log('Setting reference data:', data);
        set({ referenceData: data, error: null });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'agistme-reference-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
