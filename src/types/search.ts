import { Suburb } from './suburb';
import { AgistmentResponse } from './agistment';

export type PaddockType = 'Private' | 'Shared' | 'Group';
export type CareType = 'Self' | 'Part' | 'Full';
export type FacilityKey = 'feedRoom' | 'tackRoom' | 'floatParking' | 'hotWash' | 'tieUp' | 'stables';

export enum MatchType {
  EXACT = 'EXACT',
  ADJACENT = 'ADJACENT'
}

export interface AgistmentSearchResponse extends AgistmentResponse {
  matchType: MatchType;
}

export interface SearchResponse {
  results: AgistmentSearchResponse[];
  count: number;
  totalCount: number;
  nextToken?: string;
}

export interface SearchRequest {
  suburbs: Suburb[];
  radius?: number;
  paddockTypes: PaddockType[];
  spaces: number;
  maxPrice: number;
  hasArena: boolean;
  hasRoundYard: boolean;
  facilities: FacilityKey[];
  careTypes: CareType[];
}
