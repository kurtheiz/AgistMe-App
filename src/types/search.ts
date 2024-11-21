import { Suburb } from './generated/models/Suburb';

export type PaddockType = 'Private' | 'Shared' | 'Group';
export type CareType = 'Full' | 'Part' | 'Self';

export interface Facility {
  feedRoom: boolean;
  tackRoom: boolean;
  floatParking: boolean;
  hotWash: boolean;
  tieUp: boolean;
  stable: boolean;
}

export interface SearchCriteria {
  suburbs: Suburb[];
  radius: number;
  paddockType: PaddockType;
  spaces: number;
  maxPrice: number;
  hasArena: boolean;
  hasRoundYard: boolean;
  facilities: Facility;
  careType: CareType;
}
