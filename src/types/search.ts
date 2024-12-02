import { Suburb } from './suburb';
import { FacilityType } from './agistment';

export type PaddockType = 'Private' | 'Shared' | 'Group';
export type CareType = 'Self' | 'Part' | 'Full';

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
