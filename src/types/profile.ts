import { Location } from './agistment.ts';
import { SearchRequest } from './search';

export interface Favourite {
    id: string;
    name: string;
    lastUpdate: string;
    status: string;
    location: Location;
    photo: string;
}

export interface Horse {
    id: string;
    name: string;
    age?: number;
    breed?: string;
    description?: string;
    discipline?: string;
    height?: number;
    lastUpdate?: string;
    photo?: string;
    sex?: string;
    temperament?: string;
    gender?: string;
    colour?: string;
    size?: string;
    yearOfBirth?: number;
}

export interface SavedSearch {
    id: string;
    name: string;
    lastUpdate: string;
    searchCriteria: SearchRequest;
    enableNotifications: boolean;
}

export interface ProfileResponse {
    id: string;
    address?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    geohash?: string;
    dateOfBirth?: string;
    mobile?: string;
    postcode?: string;
    profilePhoto?: string;
    region?: string;
    state?: string;
    suburb?: string;
    lastUpdate?: string;
    comments?: string;
    shareId: string;
    showProfileInEnquiry: boolean;
}

export interface Profile extends ProfileResponse {}

export interface ProfileUpdateRequest {
    address?: string;
    firstName?: string;
    lastName?: string;
    geohash?: string;
    dateOfBirth?: string;
    mobile?: string;
    postcode?: string;
    profilePhoto?: string;
    region?: string;
    state?: string;
    suburb?: string;
    comments?: string;
    showProfileInEnquiry: boolean;
}

export interface SavedSearchesResponse {
    savedSearches: SavedSearch[];
}

export interface HorsesResponse {
    horses: Horse[];
}

export interface FavouritesResponse {
    favourites: Favourite[];
}
