export interface EnquiryRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  mobile_phone?: string;
  message: string;
  bioShareId?: string;
}

export interface EnquiryResponse {
  id: string;
  agistment_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  mobile_phone?: string;
  bioShareId?: string;
  message: string;
  read: boolean;
  created_at: string;
}
