import { createApi, API_BASE_URL } from '../hooks/useApi';
import { 
  Agistment, 
  AgistmentResponse,
  AgistmentBasicInfo,
  AgistmentDescription,
  AgistmentContact,
  AgistmentListingType,
  AgistmentPhotos,
  AgistmentServices,
  AgistmentRidingFacilities,
  AgistmentFacilities,
  AgistmentCare,
  AgistmentPaddocks,
  AgistmentVisibility,
  AgistmentPropertyLocation,
} from '../types/agistment';

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

  async searchAgistments(searchHash: string): Promise<AgistmentResponse> {
    try {
      const url = `v1/agistments?q=${encodeURIComponent(searchHash)}`;
      const response = await this.api.get<AgistmentResponse>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to search agistments:', error);
      throw error;
    }
  }

  async getAgistment(id: string): Promise<Agistment> {
    try {
      const response = await this.api.get<Agistment>(`v1/agistments/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to get agistment ${id}:`, error);
      throw error;
    }
  }

  async updateAgistment(id: string, agistment: Partial<Agistment>): Promise<Agistment> {
    try {
      const response = await this.api.put<Agistment>(`v1/protected/agistments/${id}`, agistment);
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

  async createFromText(text: string): Promise<Agistment> {
    try {
      const response = await this.api.post<Agistment>('v1/protected/agistments/from-text', text, {
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

  async getMyAgistments(): Promise<{ agistments: Agistment[], count: number, totalNewEnquiries: number }> {
    try {
      const response = await this.api.get<{ agistments: Agistment[], count: number, totalNewEnquiries: number }>('v1/protected/agistments/my');
      console.log('My Agistments Response:', response.data);
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

  async getFavoriteAgistments(): Promise<Agistment[]> {
    try {
      const response = await this.api.get<Agistment[]>('v1/protected/agistments/favourites');
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

  // New section-specific update methods
  async updateBasicInfo(id: string, data: AgistmentBasicInfo): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'basicInfo', data);
  }

  async updatePropertyDescription(id: string, data: AgistmentDescription): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'propertyDescription', data);
  }

  async updatePropertyLocation(id: string, data: AgistmentPropertyLocation): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'propertyLocation', data);
  }

  async updateContact(id: string, data: AgistmentContact): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'contact', data);
  }

  async updateListing(id: string, data: AgistmentListingType): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'listing', data);
  }

  async updatePhotoGallery(id: string, data: AgistmentPhotos): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'photoGallery', data);
  }

  async updatePropertyServices(id: string, data: AgistmentServices): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'propertyServices', data);
  }

  async updateRidingFacilities(id: string, data: AgistmentRidingFacilities): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'ridingFacilities', data);
  }

  async updateFacilities(id: string, data: AgistmentFacilities): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'facilities', data);
  }

  async updateCare(id: string, data: AgistmentCare): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'care', data);
  }

  async updatePaddocks(id: string, data: AgistmentPaddocks): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'paddocks', data);
  }

  async updateVisibility(id: string, data: AgistmentVisibility): Promise<Agistment> {
    return this.updateAgistmentSection(id, 'visibility', data);
  }

  private async updateAgistmentSection<T>(id: string, section: string, data: T): Promise<Agistment> {
    try {
      const response = await this.api.patch<Agistment>(
        `v1/protected/agistments/${id}/${section}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to update agistment ${id} section ${section}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const agistmentService = new AgistmentService();
