export interface AgistmentResponse {
  original: Agistment[];
  adjacent: Agistment[];
  originalCount: number;
  adjacentCount: number;
}

export interface Arena {
  comments: string;
  features: string[];
  length: number;
  width: number;
}

export interface RoundYard {
  comments: string;
  diameter: number;
}

export interface ContactDetails {
  email: string;
  name: string;
  number: string;
}

export interface Location {
  address: string;
  hidden: boolean;
  postCode: string;
  region: string;
  state: string;
  suburb: string;
}

export interface Facility {
  available: boolean;
  comments: string;
}

export interface PricedFacility extends Facility {
  monthlyPrice: number;
}

export interface Paddock {
  available: number;
  comments: string;
  total: number;
  weeklyPrice: number;
  whenAvailable: string | null;
}

export interface Stables extends Facility {
  quantity: number;
}

export interface Agistment {
  id: string;
  arena: boolean;
  arenas: Arena[];
  contactDetails: ContactDetails;
  createdAt: string;
  description: string;
  feedRoom: Facility;
  floatParking: PricedFacility;
  fullCare: PricedFacility;
  geohash: string;
  groupPaddocks: Paddock;
  GSI1PK: string;
  hidden: boolean;
  hotWash: Facility;
  listingType: string;
  location: Location;
  modifiedAt: string;
  name: string;
  partCare: PricedFacility;
  photos: string[];
  privatePaddocks: Paddock;
  roundYard: boolean;
  roundYards: RoundYard[];
  selfCare: PricedFacility;
  services: string[];
  sharedPaddocks: Paddock;
  socialMedia: string[];
  stables: Stables;
  tackRoom: Facility;
  tieUp: Facility;
  urgentAvailability: boolean;
}
