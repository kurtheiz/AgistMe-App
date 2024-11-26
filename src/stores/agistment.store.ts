import { create } from 'zustand';
import { Agistment } from '../types/agistment';

interface AgistmentState {
  tempAgistments: Record<string, Agistment>;
  tempAgistmentTexts: Record<string, string>;
  setTempAgistment: (id: string, agistment: Agistment) => void;
  setTempAgistmentText: (id: string, text: string) => void;
  getTempAgistment: (id: string) => Agistment | null;
  getTempAgistmentText: (id: string) => string | null;
  removeTempAgistment: (id: string) => void;
}

export const useAgistmentStore = create<AgistmentState>((set, get) => ({
  tempAgistments: {},
  tempAgistmentTexts: {},
  
  setTempAgistment: (id: string, agistment: Agistment) => 
    set((state) => ({
      tempAgistments: {
        ...state.tempAgistments,
        [id]: agistment
      }
    })),

  setTempAgistmentText: (id: string, text: string) =>
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
      const { [id]: removedAgistment, ...restAgistments } = state.tempAgistments;
      const { [id]: removedText, ...restTexts } = state.tempAgistmentTexts;
      return { 
        tempAgistments: restAgistments,
        tempAgistmentTexts: restTexts
      };
    })
}));
