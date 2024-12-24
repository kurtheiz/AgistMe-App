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
  current_period_end_date: string;
  current_period_start: number;
  current_period_start_date: string;
  metadata: {
    "Agistment Listing": string;
    listing_type: string;
  };
  trial_end?: number;
  trial_end_date?: string;
  default_payment_method?: string;
  agistmentId: string;
  agistmentName: string | null;
  price_amount: number;
  price_currency: string;
  latest_invoice: string;
  invoice_count: number;
  days_until_billing: number;
  billing_starts: string;
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
  status: string;
  client_reference_id?: string;
  customer_email?: string;
}
