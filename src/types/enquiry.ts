import { ProfileResponse } from './profile';

export interface EnquiryRequest {
  first_name?: string;
  last_name?: string;
  enquiry_type: string;
  email: string;
  mobile_phone?: string;
  message: string;
  bioShareId?: string;
}

export interface EnquiryResponse {
  id: string;
  agistment_id: string;
  agistment_name: string;
  first_name?: string;
  last_name?: string;
  enquiry_type: string;
  email: string;
  mobile_phone?: string;
  bioShareId?: string;
  message: string;
  read: boolean;
  created_at: string;
  bio?: ProfileResponse;
}

export interface EnquiriesResponse {
  enquiries: EnquiryResponse[];
}
