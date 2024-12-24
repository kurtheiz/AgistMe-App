import { createApi, API_BASE_URL } from '../hooks/useApi';
import { 
  CreateCheckoutSessionRequest, 
  CheckoutSessionResponse,
  SubscriptionResponse
} from '../types/payment';

class PaymentsService {
  private api;

  constructor() {
    this.api = createApi(API_BASE_URL);
  }

  private async waitForAuth() {
    // Wait for Clerk to be available
    let attempts = 0;
    const maxAttempts = 20; // 1 second total wait time
    
    while (!window.Clerk && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    if (!window.Clerk) {
      console.warn('Clerk not available after waiting');
      return;
    }
    
    // Wait for session to be initialized
    await window.Clerk.load();
  }

  private async getAuthHeaders() {
    try {
      await this.waitForAuth();
      const session = await window.Clerk?.session;
      if (!session) {
        // Return empty headers for non-authenticated requests
        return {};
      }
      const token = await session.getToken({ template: 'AgistMe' });
      if (token) {
        return {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
      }
      return {};
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return {};
    }
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.post<CheckoutSessionResponse>(
        'v1/protected/payments/create-checkout-session', 
        request,
        authHeaders
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async getSubscriptions(): Promise<SubscriptionResponse[]> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<SubscriptionResponse[]>(
        'v1/protected/payments/subscriptions',
        authHeaders
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }
  }

  async getSubscriptionInvoices(subscription_id: string) {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get(
        `/v1/protected/payments/subscriptions/${subscription_id}/invoices`,
        authHeaders
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription invoices:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const paymentsService = new PaymentsService();
