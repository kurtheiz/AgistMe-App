import { OpenAPI } from '../types/generated/core/OpenAPI';
import { ReferenceService as GeneratedReferenceService } from '../types/generated/services/ReferenceService';
import type { PricingPlan } from '../types/generated/models/PricingPlan';
import type { ReferenceData } from '../types/reference';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Configure the OpenAPI base URL
OpenAPI.BASE = API_BASE_URL;

class ReferenceService {
  async getReferenceData(): Promise<ReferenceData[]> {
    try {
      console.log('Fetching reference data from:', `${API_BASE_URL}/rd`);
      const response = await GeneratedReferenceService.getReferenceDataV1ReferenceDataGet();
      console.log('Reference data response:', response);
      
      // Map PricingPlan[] to ReferenceData[]
      return response.pricingPlans.map((plan: PricingPlan) => ({
        id: plan.name.toLowerCase().replace(/\s+/g, '-'), // Generate an ID from the name
        name: plan.name,
        description: `${plan.billingPeriod} plan`, // Use billing period as description
        price: plan.price,
        features: Object.entries(plan.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature]) => feature),
        recommended: plan.recommended
      }));
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const referenceService = new ReferenceService();
