import { createApi, API_BASE_URL } from '../hooks/useApi';
import { EnquiriesResponse, EnquiryRequest, EnquiryStatusUpdate } from '../types/enquiry';

class EnquiriesService {
  private api;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

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

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        if (attempt === this.maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    throw lastError;
  }

  async getEnquiries(): Promise<EnquiriesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<EnquiriesResponse>('v1/protected/enquiries');
        return response.data;
      } catch (error) {
        console.error('Failed to get enquiries:', error);
        throw error;
      }
    });
  }

  async markEnquiryAsRead(enquiryId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.put(`v1/protected/enquiries/${enquiryId}/read`, {});
      } catch (error) {
        console.error('Failed to mark enquiry as read:', error);
        throw error;
      }
    });
  }

  async markEnquiryAsUnread(enquiryId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.put(`v1/protected/enquiries/${enquiryId}/unread`, {});
      } catch (error) {
        console.error('Failed to mark enquiry as unread:', error);
        throw error;
      }
    });
  }

  async getAgistmentEnquiries(agistmentId: string): Promise<EnquiriesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<EnquiriesResponse>(`v1/protected/agistments/${agistmentId}/enquiries`);
        return response.data;
      } catch (error) {
        console.error('Failed to get agistment enquiries:', error);
        throw error;
      }
    });
  }

  async submitEnquiry(agistmentId: string, enquiry: EnquiryRequest): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.post(`v1/protected/agistments/${agistmentId}/enquiries`, enquiry);
      } catch (error) {
        console.error('Failed to submit enquiry:', error);
        throw error;
      }
    });
  }

  async updateEnquiryStatus(enquiryId: string, update: EnquiryStatusUpdate): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.put(`v1/protected/enquiries/${enquiryId}/status`, update);
      } catch (error) {
        console.error('Failed to update enquiry status:', error);
        throw error;
      }
    });
  }
}

// Create a singleton instance
export const enquiriesService = new EnquiriesService();
