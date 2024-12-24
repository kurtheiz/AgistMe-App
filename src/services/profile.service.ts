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
  FavouritesResponse,
  SavedSearch,
  Favourite
} from '../types/profile';

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
      const response = await this.api.post<PresignedUrlResponse[]>('v1/presigned-urls', {
        filenames: [file.name],
        image_type: 'profile'
      });

      const { url, fields, publicUrl } = response.data[0];

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

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload profile photo:', error);
      throw error;
    }
  }

}

// Create a singleton instance
export const profileService = new ProfileService();
