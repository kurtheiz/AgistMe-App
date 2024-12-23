export enum ListingType {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  PROFESSIONAL = "PROFESSIONAL"
}

export interface CreateCheckoutSessionRequest {
  listing_type: ListingType;
}

export interface CreateSubscriptionRequest {
  listing_type: ListingType;
}

export interface SubscriptionResponse {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  current_period_start: number;
  metadata: Record<string, any>;
  trial_end?: number;
  default_payment_method?: string;
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
  status: string;
  client_reference_id?: string;
  customer_email?: string;
}
