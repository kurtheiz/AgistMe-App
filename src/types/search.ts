import { Suburb } from './suburb';

export type PaddockType = 'Private' | 'Shared' | 'Group';
export type CareType = 'Self' | 'Part' | 'Full';
export type FacilityType = 'feedRoom' | 'tackRoom' | 'floatParking' | 'hotWash' | 'tieUp' | 'stable';

export interface SearchCriteria {
  suburbs: Suburb[];
  radius: number;
  paddockTypes: PaddockType[];
  spaces: number;
  maxPrice: number;
  hasArena: boolean;
  hasRoundYard: boolean;
  facilities: FacilityType[];
  careTypes: CareType[];
  searchHash?: string;
}
