import { Suburb } from './suburb';

export interface Horse {
    name: string;
    breed: string;
    gender: string;
    colour: string;
    size: number;
    yearOfBirth: number;
    photo?: string;
    description?: string;
}

export interface Profile {
    id: string;
    shareId: string;
    showProfileInEnquiry: boolean;
    email: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    geohash?: string;
    mobile?: string;
    dateOfBirth?: string;  // ISO date string format
    postcode?: string;
    profilePhoto?: string;
    region?: string;
    state?: string;
    suburb?: string | Suburb;
    suburbId?: string;
    lastUpdate: string;
    comments?: string;
    horses?: Horse[];
    favourites?: string[];
}

export interface UpdateProfileRequest extends Omit<Profile, 'id' | 'email' | 'lastUpdate'> {}
