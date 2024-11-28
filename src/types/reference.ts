export type BillingPeriod = 'Free' | 'Weekly' | 'Monthly';
export type SearchPlacement = 'Standard' | 'Enhanced';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface PhotosLimit {
  included: boolean;
  limit: number;
}

export type FeatureValue = boolean | string | NotificationPreferences | PhotosLimit;

export interface PlanFeature {
  key: string;
  name: string;
  description: string;
  value: FeatureValue;
}

export interface PricePlan {
  name: string;
  shortDescription: string;
  price: number;
  billingPeriod: BillingPeriod;
  features: PlanFeature[];
  recommended: boolean;
}

export interface ReferenceData {
  pricingPlans: PricePlan[];
}
