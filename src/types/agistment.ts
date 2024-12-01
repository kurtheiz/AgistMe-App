export type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ListingType = 'STANDARD' | 'FEATURED' | 'PREMIUM' | 'PROFESSIONAL';

export interface AgistmentResponse {
  original: Agistment[];
  adjacent: Agistment[];
  totalCount: number;
  originalCount: number;
  adjacentCount: number;
  nextToken?: string;
}

export interface Arena {
  comments: string;
  features: string[];
  length: number;
  width: number;
}

export interface ContactDetails {
  email: string;
  name: string;
  number: string;
}

export interface FacilityBase {
  available: boolean;
  comments: string;
}

export interface PricedFacility extends FacilityBase {
  monthlyPrice: number;
}

export interface FloatParking extends PricedFacility {}

export interface PaddockBase {
  available: number;
  comments: string;
  total: number;
  weeklyPrice: number;
  totalPaddocks: number;
  whenAvailable?: Date;
}

export interface Location {
  address: string;
  postcode: string;
  region: string;
  state: string;
  suburb: string;
}

export interface Photo {
  comment?: string;
  link: string;
}

export interface RoundYard {
  comments: string;
  diameter: number;
}

export interface SocialMediaLink {
  link: string;
  type: string;
}

export interface Stables extends FacilityBase {
  quantity: number;
}

export interface AgistmentBasicInfo {
  name: string;
  propertySize: number;
}

export interface AgistmentPhotos {
  photos: Photo[];
}

export interface AgistmentDescription {
  description: string;
}

export interface AgistmentServices {
  services: string[];
}

export interface AgistmentPropertyLocation {
  location: Location;
}

export interface AgistmentContact {
  contactDetails: ContactDetails;
}

export interface AgistmentListingType {
  listingType: ListingType;
}

export interface AgistmentPaddocks {
  groupPaddocks: PaddockBase;
  privatePaddocks: PaddockBase;
  sharedPaddocks: PaddockBase;
}

export interface AgistmentRidingFacilities {
  arenas: Arena[];
  roundYards: RoundYard[];
}

export interface AgistmentFacilities {
  feedRoom: FacilityBase;
  floatParking: FloatParking;
  hotWash: FacilityBase;
  tackRoom: FacilityBase;
  tieUp: FacilityBase;
  stables: Stables;
}

export interface AgistmentCare {
  fullCare: PricedFacility;
  partCare: PricedFacility;
  selfCare: PricedFacility;
}

export interface AgistmentVisibility {
  hidden: boolean;
}

export interface Agistment {
  id: string;
  status: Status;
  ridingFacilities: AgistmentRidingFacilities;
  contact: AgistmentContact;
  createdAt?: string;
  propertyDescription: AgistmentDescription;
  facilities: AgistmentFacilities;
  visibility: AgistmentVisibility;
  listing: AgistmentListingType;
  propertyLocation: AgistmentPropertyLocation;
  modifiedAt?: string;
  basicInfo: AgistmentBasicInfo;
  paddocks: AgistmentPaddocks;
  photoGallery: AgistmentPhotos;
  propertyServices: AgistmentServices;
  care: AgistmentCare;
  socialMedia: SocialMediaLink[];
  urgentAvailability: boolean;
  paddockTypes: string[];
  views?: number;
}
