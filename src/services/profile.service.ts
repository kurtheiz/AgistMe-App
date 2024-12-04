import { createApi, API_BASE_URL } from '../hooks/useApi';
import { Profile, UpdateProfileRequest } from '../types/profile';

interface PresignedUrlRequest {
  filenames: string[];
  agistment_id?: string;
  image_type: string;
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

  async getProfile(): Promise<Profile> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.get<Profile>('/v1/protected/profile');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    });
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<Profile> {
    return this.retryOperation(async () => {
      try {
        const response = await this.api.put<Profile>('/v1/protected/profile', profileData);
        return response.data;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    });
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      // Get presigned URL
      const filename = `${Date.now()}-${file.name}`;
      const presignedRequest: PresignedUrlRequest = {
        filenames: [filename],
        image_type: 'profile'
      };
      
      console.log('Requesting presigned URL...');
      const response = await this.api.post<PresignedUrlResponse[]>('/v1/presigned-urls', presignedRequest);
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

      console.log('Upload successful');
      // Return the publicUrl from the presigned URL response
      console.log('Public URL:', presignedData.publicUrl);
      return presignedData.publicUrl;
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
      const response = await this.api.post<PresignedUrlResponse[]>('/v1/presigned-urls', presignedRequest);
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

  async updateHorsePhoto(horseName: string, photoUrl: string): Promise<Profile> {
    try {
      // Get current profile first
      const currentProfile = await this.getProfile();
      
      // Update the specific horse's photo
      const updatedHorses = (currentProfile.horses || []).map(horse => 
        horse.name === horseName 
          ? { ...horse, photo: photoUrl }
          : horse
      );

      // Update the entire profile
      const updateData = {
        ...currentProfile,
        horses: updatedHorses
      };
      
      // Remove fields that shouldn't be sent in update
      const { id, email, lastUpdate, ...profileUpdateData } = updateData;
      
      return await this.updateProfile(profileUpdateData);
    } catch (error) {
      console.error('Failed to update horse photo:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService();
