import { createApi, API_BASE_URL } from '../hooks/useApi';
import type { PricingPlan } from '../types/pricing';
import type { ReferenceData } from '../types/reference';

class ReferenceService {
  private api;

  constructor() {
    this.api = createApi(API_BASE_URL);
  }

  async getReferenceData(): Promise<ReferenceData[]> {
    try {
      const response = await this.api.get<{ pricingPlans: PricingPlan[] }>('/v1/rd');
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
