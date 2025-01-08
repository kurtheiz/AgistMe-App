declare global {
  interface Window {
    Clerk: any;
  }
}

import { createApi, API_BASE_URL } from '../hooks/useApi';
import { AgistmentResponse } from '../types/agistment';
import { SearchResponse } from '../types/search';
import { EnquiryRequest, EnquiryResponse } from '../types/enquiry';

interface PresignedUrlRequest {
  filenames: string[];
  agistmentId: string;
  image_type: string;
}

interface PresignedUrlResponse {
  url: string;
  fields: { [key: string]: string };
  publicUrl: string;
}

class AgistmentService {
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

  async searchAgistments(searchHash: string, nextToken: string): Promise<SearchResponse> {
    try {
      const url = `v1/agistments?q=${encodeURIComponent(searchHash)}${nextToken ? `&n=${encodeURIComponent(nextToken)}` : ''}`;
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<SearchResponse>(url, authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to search agistments:', error);
      throw error;
    }
  }

  async getAgistment(id: string, count: boolean=false): Promise<AgistmentResponse> {
    return this.retryOperation(async () => {
      const response = await this.api.get<AgistmentResponse>(`v1/agistments/${id}?count=${count}`);
      return response.data;
    });
  }

  async submitEnquiry(agistmentId: string, enquiry: EnquiryRequest): Promise<EnquiryResponse> {
    return this.retryOperation(async () => {
      const response = await this.api.post<EnquiryResponse>(`v1/agistments/${agistmentId}/enquiry`, enquiry);
      return response.data;
    });
  }

  async getBlankAgistment(): Promise<AgistmentResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<AgistmentResponse>('v1/protected/agistments/blank', authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get blank agistment:', error);
      throw error;
    }
  }

  async getSubscription(agistmentId: string): Promise<any> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get(`v1/protected/agistments/${agistmentId}/subscription`, authHeaders);
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw error;
    }
  }

  async updateAgistment(id: string, agistment: Partial<AgistmentResponse>): Promise<AgistmentResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.put<AgistmentResponse>(`v1/protected/agistments/${id}`, agistment, authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to update agistment ${id}:`, error);
      throw error;
    }
  }

  async deleteAgistment(id: string): Promise<void> {
    try {
      const authHeaders = await this.getAuthHeaders();
      await this.api.delete(`v1/protected/agistments/${id}`, authHeaders);
    } catch (error: unknown) {
      console.error(`Failed to delete agistment ${id}:`, error);
      throw error;
    }
  }

  async updateFromText(agistmentId: string, text: string): Promise<AgistmentResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.put<AgistmentResponse>(
        `v1/protected/agistments/${agistmentId}/from-text`,
        text,
        {
          ...authHeaders,
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'text/plain',
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to update agistment from text:', error);
      throw error;
    }
  }

  async createFromText(text: string): Promise<AgistmentResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.post<AgistmentResponse>('/agistments/create-from-text', { text }, authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to create agistment from text:', error);
      throw error;
    }
  }

  async getMyAgistments(): Promise<SearchResponse> {
    try {
      const url = 'v1/protected/agistments/my';
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<SearchResponse>(url, authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get my agistments:', error);
      throw error;
    }
  }

  async getFeaturedAgistments(): Promise<SearchResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<SearchResponse>('v1/agistments/featured', authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get featured agistments:', error);
      throw error;
    }
  }

  async getFavoriteAgistments(): Promise<SearchResponse> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.get<SearchResponse>('v1/protected/agistments/favourites', authHeaders);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get favourite agistments:', error);
      throw error;
    }
  }

  async getAgistmentCount(): Promise<number> {
    try {
      const response = await this.api.get<{ count: number }>('v1/agistments/count');
      return response.data.count;
    } catch (error: unknown) {
      console.error('Failed to get agistment count:', error);
      return 0;
    }
  }

  async registerForNotifications(email: string): Promise<{ message: string; email: string }> {
    try {
      const response = await this.api.post<{ message: string; email: string }>('v1/agistments/notify', { email });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to register for notifications:', error);
      throw error;
    }
  }

  async unregisterFromNotifications(email: string, category: string): Promise<{ message: string }> {
    const response = await this.api.post('/v1/agistments/unnotify', {
      email,
      category
    });
    return response.data;
  }

  async uploadAgistmentPhoto(file: File, agistmentId: string): Promise<string> {
    try {
      // Get presigned URL
      const filename = `${Date.now()}-agistment-${agistmentId}-${file.name}`;
      const presignedRequest: PresignedUrlRequest = {
        filenames: [filename],
        agistmentId: agistmentId,
        image_type: 'agistment'
      };
      
      const authHeaders = await this.getAuthHeaders();
      const response = await this.api.post<PresignedUrlResponse[]>('v1/presigned-urls', presignedRequest, authHeaders);
      const presignedData = response.data[0];

      // Create form data for S3 upload
      const formData = new FormData();
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      // Upload to S3
      const uploadResponse = await fetch(presignedData.url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
      }

      return presignedData.publicUrl;
    } catch (error) {
      throw error;
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error('Operation failed:', error);
      throw error;
    }
  }
}
// Create a singleton instance
export const agistmentService = new AgistmentService();
