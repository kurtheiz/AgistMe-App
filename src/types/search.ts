import { Suburb } from './suburb';

export type PaddockType = 'Private' | 'Shared' | 'Group';
export type CareType = 'Self' | 'Part' | 'Full';

export type FacilityKey = 'feedRoom' | 'tackRoom' | 'floatParking' | 'hotWash' | 'tieUp' | 'stables';

export interface SearchCriteria {
  suburbs: Suburb[];
  radius: number;
  paddockTypes: PaddockType[];
  spaces: number;
  maxPrice: number;
  hasArena: boolean;
  hasRoundYard: boolean;
  facilities: FacilityKey[];
  careTypes: CareType[];
  searchHash?: string;
}
