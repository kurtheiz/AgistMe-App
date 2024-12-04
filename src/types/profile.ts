export interface Horse {
  id: string;
  name: string;
  breed: string;
  gender: string;
  description?: string;
  colour?: string;
  size?: number;
  yearOfBirth?: number;
  photo?: string;
}

export interface FavoriteItem {
    agistmentId: string;
    lastUpdate: string;
}

export interface SavedSearch {
    id: string;
    name: string;
    searchHash: string;
    lastUpdate: string;
}

export interface Profile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    profilePhoto: string;
    address: string;
    postcode: string;
    suburb: string;
    state: string;
    region: string;
    suburbId: string;
    geohash: string;
    dateOfBirth: string;
    comments: string;
    shareId: string;
    showProfileInEnquiry: boolean;
    availability?: string;
    lastUpdate: string;
    horses: Horse[];
    favourites: FavoriteItem[];
    savedSearches: SavedSearch[];
    agistor: boolean;
    myAgistments: string[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  comments?: string;
  profilePhoto?: string;
  mobile?: string;
  dateOfBirth?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  geohash?: string;
  suburbId?: string;
  region?: string;
  showProfileInEnquiry?: boolean;
  agistor?: boolean;
  favourites?: FavoriteItem[];
}
