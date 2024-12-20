declare global {
  interface Window {
    Clerk: any;
  }
}

import { createApi, API_BASE_URL } from '../hooks/useApi';
import { 
  ProfileResponse, 
  ProfileUpdateRequest, 
  SavedSearchesResponse, 
  HorsesResponse, 
  FavouritesResponse,
  SavedSearch,
  Horse,
  Favourite
} from '../types/profile';

interface PresignedUrlRequest {
  filenames: string[];
  image_type: 'profile' | 'agistment';
  agistment_id?: string;
}

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  s3Key: string;
  filename: string;
  publicUrl: string;
}

class ProfileService {
  private api;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.api = createApi(API_BASE_URL);
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        if (attempt === this.maxRetries) break;
        
        // Wait before retrying, with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    throw lastError;
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<ProfileResponse>('v1/protected/profile');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    });
  }

  async getSharedProfile(shareId: string): Promise<ProfileResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<ProfileResponse>(`v1/protected/profile/shared/${shareId}`);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching shared profile:', error);
        throw error;
      }
    });
  }

  async updateProfile(profileData: ProfileUpdateRequest): Promise<ProfileResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.put<ProfileResponse>('v1/protected/profile', profileData);
        return response.data;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    });
  }

  async getSavedSearches(): Promise<SavedSearchesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<SavedSearchesResponse>('v1/protected/profile/savedsearches');
        return response.data;
      } catch (error) {
        console.error('Failed to get saved searches:', error);
        throw error;
      }
    });
  }

  async updateSavedSearches(savedSearches: SavedSearch[]): Promise<SavedSearchesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.put<SavedSearchesResponse>('v1/protected/profile/savedsearches', {
          savedSearches
        });
        return response.data;
      } catch (error) {
        console.error('Failed to update saved searches:', error);
        throw error;
      }
    });
  }

  async getHorses(): Promise<HorsesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<HorsesResponse>('v1/protected/profile/horses');
        return response.data;
      } catch (error) {
        console.error('Failed to get horses:', error);
        throw error;
      }
    });
  }

  async updateHorses(horses: Horse[]): Promise<HorsesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.put<HorsesResponse>('v1/protected/profile/horses', {
          horses
        });
        return response.data;
      } catch (error) {
        console.error('Failed to update horses:', error);
        throw error;
      }
    });
  }

  async getFavourites(): Promise<FavouritesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<FavouritesResponse>('v1/protected/profile/favourites');
        return response.data;
      } catch (error) {
        console.error('Error getting favourites:', error);
        throw error;
      }
    });
  }

  async updateFavourites(favourites: Favourite[]): Promise<FavouritesResponse> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.put<FavouritesResponse>('v1/protected/favourites', { favourites });
        return response.data;
      } catch (error) {
        console.error('Error updating favourites:', error);
        throw error;
      }
    });
  }

  async toggleFavorite(agistmentId: string, currentStatus: boolean): Promise<boolean> {
    return this.retryOperation(async () => {
      try {
        if (currentStatus) {
          await this.api.delete(`v1/protected/profile/favourites/${agistmentId}`);
          return false;
        } else {
          await this.api.post(`v1/protected/profile/favourites/${agistmentId}`);
          return true;
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    });
  }

  async deleteFavorite(agistmentId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.delete(`v1/protected/profile/favourites/${agistmentId}`);
      } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
      }
    });
  }

  async deleteProfile(): Promise<void> {
    return this.retryOperation(async () => {
      try {
        await this.api.delete('v1/protected/profile');
      } catch (error) {
        console.error('Failed to delete profile:', error);
        throw error;
      }
    });
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      // Get presigned URL
      const response = await this.api.post<PresignedUrlResponse[]>('v1/protected/upload/presigned', {
        filenames: [file.name],
        image_type: 'profile'
      });

      const { url, fields, s3Key } = response.data[0];

      // Create form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      // Upload to S3
      await fetch(url, {
        method: 'POST',
        body: formData
      });

      return s3Key;
    } catch (error) {
      console.error('Failed to upload profile photo:', error);
      throw error;
    }
  }

  async uploadHorsePhoto(file: File, horseName: string): Promise<string> {
    try {
      // Get presigned URL
      const filename = `${Date.now()}-horse-${horseName}-${file.name}`;
      const presignedRequest: PresignedUrlRequest = {
        filenames: [filename],
        image_type: 'profile'
      };
      
      console.log('Requesting presigned URL for horse photo...');
      const response = await this.api.post<PresignedUrlResponse[]>('v1/presigned-urls', presignedRequest);
      const presignedData = response.data[0];
      console.log('Received presigned URL data:', presignedData);

      // Create form data for S3 upload
      const formData = new FormData();
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      console.log('Uploading horse photo to S3...');
      // Upload to S3
      const uploadResponse = await fetch(presignedData.url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload horse photo to S3: ${uploadResponse.statusText}`);
      }

      console.log('Horse photo upload successful');
      return presignedData.publicUrl;
    } catch (error) {
      console.error('Failed to upload horse photo:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService();
