import { createApi, API_BASE_URL } from '../hooks/useApi';
import { 
  CreateCheckoutSessionRequest, 
  CheckoutSessionResponse, 
  CreateSubscriptionRequest,
  SubscriptionResponse
} from '../types/payment';

class PaymentsService {
  private api;

  constructor() {
    this.api = createApi(API_BASE_URL, async () => {
      // Wait for Clerk to be available
      while (!window.Clerk) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      // Wait for session to be initialized
      await window.Clerk.load();
      return window.Clerk.session?.getToken() || null;
    });
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      const response = await this.api.post<CheckoutSessionResponse>(
        'v1/protected/payments/create-checkout-session', 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const response = await this.api.post<SubscriptionResponse>(
        '/payments/subscription', 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const paymentsService = new PaymentsService();
