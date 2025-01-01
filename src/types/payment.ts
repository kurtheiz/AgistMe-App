export enum ListingType {
  STANDARD = "STANDARD",
  PROFESSIONAL = "PROFESSIONAL"
}

/**
 * Request model for creating a checkout session.
 */
export interface CreateCheckoutSessionRequest {
  /** Type of listing subscription */
  listing_type: ListingType;
  /** ID of the agistment to create subscription for */
  agistment_id: string;
  /** URL to redirect to after successful payment */
  successUrl: string;
  /** URL to redirect to if user cancels */
  cancelUrl: string;
}



export interface CheckoutSessionResponse {
  id: string;
  url: string;
  status: string;
  client_reference_id?: string;
  customer_email?: string;
}

export interface SubscriptionResponse {
  id: string;
  customer: string;
  status: string;
  current_period_end_date: string;
  current_period_start_date: string;
  metadata: {
    'Agistment Listing': string;
    listing_type: `ListingType.${ListingType}`;
  };
  trial_end_date: string | null;
  default_payment_method: string | null;
  price_amount: number;
  price_currency: string;
  latest_invoice: string;
  days_until_billing: number;
  billing_starts: string;
  cancel_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}
