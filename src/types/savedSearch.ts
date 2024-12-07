export interface SavedSearch {
  id: string;
  name: string;
  searchHash: string;
}

export interface UserMetadata {
  role?: string;
  savedSearches?: SavedSearch[];
}
