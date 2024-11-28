export interface AgistmentResponse {
  agistments: Agistment[];
  count: number;
  totalNewEnquiries: number;
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
  whenAvailable?: string;
}

export interface Location {
  address: string;
  postcode: string;
  region: string;
  state: string;
  suburb: string;
}

export interface Photo {
  comment: string;
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

export interface AgistmentLocation {
  location: Location;
}

export interface AgistmentContact {
  contactDetails: ContactDetails;
}

export interface AgistmentListingType {
  listingType: string;
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
  PK: string;
  SK: string;
  ridingFacilities: AgistmentRidingFacilities;
  contact: AgistmentContact;
  createdAt?: string;
  propertyDescription: AgistmentDescription;
  facilities: AgistmentFacilities;
  GSI1PK: string;
  visibility: AgistmentVisibility;
  itemType: string;
  listing: AgistmentListingType;
  propertyLocation: AgistmentLocation;
  modifiedAt?: string;
  basicInfo: AgistmentBasicInfo;
  paddocks: AgistmentPaddocks;
  photoGallery: AgistmentPhotos;
  propertyServices: AgistmentServices;
  care: AgistmentCare;
  socialMedia: SocialMediaLink[];
  status: string;
  urgentAvailability: boolean;
}
