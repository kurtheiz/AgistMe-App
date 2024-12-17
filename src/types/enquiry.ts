import { ProfileResponse } from './profile';

export interface EnquiryRequest {
  firstName?: string;
  lastName?: string;
  enquiryType: string;
  email: string;
  mobilePhone?: string;
  message: string;
  bioShareId?: string;
}

export interface EnquiryResponse {
  id: string;
  agistmentId: string;
  agistmentName: string;
  firstName?: string;
  lastName?: string;
  enquiryType: string;
  email: string;
  mobilePhone?: string;
  bioShareId?: string;
  message: string;
  read: boolean;
  acknowledged: boolean;
  createdAt: string;
  bio?: ProfileResponse;
}

export interface EnquiriesResponse {
  enquiries: EnquiryResponse[];
}

export interface EnquiryStatusUpdate {
  read?: boolean;
  acknowledged?: boolean;
}
