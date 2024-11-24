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
    favourites: string[];
}

export interface UpdateProfileRequest extends Omit<Profile, 'id' | 'email' | 'lastUpdate'> {}
