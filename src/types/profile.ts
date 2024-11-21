export interface Horse {
    id?: string;
    name: string;
    breed: string;
    gender: string;
    colour: string;
    size: number;
    yearOfBirth: number;
    profilePhoto: string;
    comments?: string;
}

export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    geohash: string;
    horses: Horse[];
    mobile: string;
    dateOfBirth: string;  // ISO date string format
    readonly postcode: string;
    profilePhoto: string;
    region: string;
    state: string;
    suburb: string;
    suburbId: string;
    lastUpdate: string;
    comments?: string;
}

export interface UpdateProfileRequest extends Omit<Profile, 'id' | 'email' | 'lastUpdate'> {}
