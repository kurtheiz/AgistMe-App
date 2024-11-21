export interface NotificationFeatures {
    email: boolean;
    sms: boolean;
    push: boolean;
}

export interface PhotoFeatures {
    maxPhotos: number;
    maxPhotoSize: number;
}

export interface PlanFeatures {
    notifications: NotificationFeatures;
    photos: PhotoFeatures;
    maxListings: number;
    maxSearchRadius: number;
    customBranding: boolean;
    analytics: boolean;
}

export interface PricingPlan {
    name: string;
    description: string;
    price: number;
    billingPeriod: string;
    features: PlanFeatures;
    recommended?: boolean;
}
