import { create } from 'zustand';
import { ListingType } from '../types/agistment';

interface ListingTypeState {
  selectedType: { listingType: ListingType };
  setSelectedType: (type: ListingType) => void;
}

export const useListingTypeStore = create<ListingTypeState>((set) => ({
  selectedType: { listingType: 'STANDARD' },
  setSelectedType: (type: ListingType) => set({ selectedType: { listingType: type } }),
}));
