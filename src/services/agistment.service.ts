import { createApi, API_BASE_URL } from '../hooks/useApi';
import { 
  AgistmentResponse
} from '../types/agistment';
import { 
  SearchResponse
} from '../types/search';

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

  async searchAgistments(searchHash: string, nextToken?: string): Promise<SearchResponse> {
    try {
      const url = `v1/agistments?q=${encodeURIComponent(searchHash)}${nextToken ? `&n=${nextToken}` : ''}`;
      const response = await this.api.get<SearchResponse>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to search agistments:', error);
      throw error;
    }
  }

  async getAgistment(id: string): Promise<AgistmentResponse> {
    try {
      const url = `v1/agistments/${encodeURIComponent(id)}`;
      const response = await this.api.get<AgistmentResponse>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get agistment:', error);
      throw error;
    }
  }

  async updateAgistment(id: string, agistment: Partial<AgistmentResponse>): Promise<AgistmentResponse> {
    try {
      const response = await this.api.put<AgistmentResponse>(`v1/protected/agistments/${id}`, agistment);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to update agistment ${id}:`, error);
      throw error;
    }
  }

  async deleteAgistment(id: string): Promise<void> {
    try {
      await this.api.delete(`v1/protected/agistments/${id}`);
    } catch (error: unknown) {
      console.error(`Failed to delete agistment ${id}:`, error);
      throw error;
    }
  }

  async createFromText(text: string): Promise<AgistmentResponse> {
    try {
      const response = await this.api.post<AgistmentResponse>('v1/protected/agistments/from-text', text, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to create agistment from text:', error);
      throw error;
    }
  }

  async getMyAgistments(): Promise<AgistmentResponse[]> {
    try {
      const url = 'v1/protected/agistments/my';
      const response = await this.api.get<AgistmentResponse[]>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get my agistments:', error);
      throw error;
    }
  }

  async getFeaturedAgistments(): Promise<AgistmentResponse> {
    try {
      const response = await this.api.get<AgistmentResponse>('v1/protected/agistments/featured');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get featured agistments:', error);
      throw error;
    }
  }

  async getFavoriteAgistments(): Promise<AgistmentResponse> {
    try {
      console.log('Calling getFavoriteAgistments API');
      const response = await this.api.get<AgistmentResponse>('v1/protected/agistments/favourites');
      console.log('API Response:', response);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get favorite agistments:', error);
      throw error;
    }
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
      
      console.log('Requesting presigned URL for agistment photo...');
      const response = await this.api.post<PresignedUrlResponse[]>('v1/presigned-urls', presignedRequest);
      const presignedData = response.data[0];
      console.log('Received presigned URL data:', presignedData);

      // Create form data for S3 upload
      const formData = new FormData();
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      console.log('Uploading to S3...');
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
}
// Create a singleton instance
export const agistmentService = new AgistmentService();
