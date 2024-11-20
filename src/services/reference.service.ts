import { createApi } from '../hooks/useApi';
import type { PricingPlan } from '../types/generated/models/PricingPlan';
import type { ReferenceData } from '../types/reference';
import { getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Configure the OpenAPI base URL
// OpenAPI.BASE = API_BASE_URL;

class ReferenceService {
  private api = createApi(API_BASE_URL, getAuthToken);

  async getReferenceData(): Promise<ReferenceData[]> {
    try {
      console.log('Fetching reference data from:', `${API_BASE_URL}/v1/rd`);
      const response = await this.api.get<{ pricingPlans: PricingPlan[] }>('/v1/rd');
      console.log('Reference data response:', response);
      
      // Map PricingPlan[] to ReferenceData[]
      return response.data.pricingPlans.map((plan: PricingPlan) => ({
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
