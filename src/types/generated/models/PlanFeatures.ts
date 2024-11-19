/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationFeatures } from './NotificationFeatures';
import type { PhotoFeatures } from './PhotoFeatures';
export type PlanFeatures = {
    additionalServices: boolean;
    enquiriesNotification: NotificationFeatures;
    propertyPhotos: PhotoFeatures;
    searchPlacement: string;
    socialMediaLinks: boolean;
    urgentAvailabilityFlag: boolean;
    viewAgisteeProfile: boolean;
    waitingLists: boolean;
    featuredBadge?: (boolean | null);
};

