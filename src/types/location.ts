export interface Location {
  id: string;
  name: string;
  state: string;
  postcode: string;
  type: 'SUBURB' | 'REGION' | 'STATE';
}

export interface SelectedLocation extends Location {
  displayText: string;
}

export type SearchMode = 'single' | 'multiple';
export type LocationType = 'all' | 'suburb-only';
