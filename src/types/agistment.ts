export type ListingType = 'STANDARD' | 'PROFESSIONAL';

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
  totalPaddocks: number;
}

export interface Location {
  address: string;
  postcode: string;
  region: string;
  state: string;
  suburb: string;
  Municipality?: string;
  Country?: string;
  Label?: string;
  Neighborhood?: string;
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

export interface Stables {
  available: boolean;
  quantity: number;
  comments?: string;
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
  fullCare: PricedFacility & { comments: string };
  partCare: PricedFacility & { comments: string };
  selfCare: PricedFacility & { comments: string };
}

export interface AnalyticsEntry {
  date: string;
  viewCount: number;
  favouritedCount: number;
  enquiriesCount: number;
}

export interface AnalyticsSummary {
  totalViewCount: number;
  totalFavouritedCount: number;
  totalEnquiriesCount: number;
  averageViewCount: number;
  averageFavouritedCount: number;
  averageEnquiriesCount: number;
}

export interface AgistmentResponse {
  id: string;
  ridingFacilities: AgistmentRidingFacilities;
  contact: AgistmentContact;
  createdAt: string | null;
  propertyDescription: AgistmentDescription;
  facilities: AgistmentFacilities;
  GSI1PK?: string;
  geohash?: string;
  latitude?: number;
  longitude?: number;
  listing: AgistmentListingType;
  propertyLocation: AgistmentPropertyLocation;
  modifiedAt: string;
  basicInfo: AgistmentBasicInfo;
  paddocks: AgistmentPaddocks;
  photoGallery: AgistmentPhotos;
  propertyServices: AgistmentServices;
  care: AgistmentCare;
  socialMedia: SocialMediaLink[];
  status: 'PUBLISHED' | 'HIDDEN' | 'REMOVED';
  urgentAvailability: boolean;
  lastUpdateDescription?: string;
  isFavourite: boolean;
  distance?: number;
  distanceFrom?: string;
  matchType?: 'EXACT' | 'ADJACENT';
  analytics: AnalyticsEntry[];
  analyticsSummary?: AnalyticsSummary;
  subscription_id?: string;
  subscription_status?: string;
}

export interface AgistmentRequest {
  // ... (no changes made here)
}
