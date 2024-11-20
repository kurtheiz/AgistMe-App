export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    geohash: string;
    horses: any[]; // TODO: Replace with proper Horse type when available
    mobile: string;
    dateOfBirth: string;  // ISO date string format
    readonly postcode: string;
    profilePhoto: string;
    region: string;
    state: string;
    suburb: string;
    suburbId: string;
    lastUpdate: string;
}

export interface UpdateProfileRequest extends Omit<Profile, 'id' | 'email' | 'lastUpdate'> {}
