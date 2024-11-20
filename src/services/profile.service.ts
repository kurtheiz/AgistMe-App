import { createApi } from '../hooks/useApi';
import { Profile, UpdateProfileRequest } from '../types/profile';
import { getAuthToken, isAuthenticated, setAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ProfileService {
  private api = createApi(API_BASE_URL, getAuthToken);

  async getProfile(token?: string): Promise<Profile> {
    try {
      if (token) {
        setAuthToken(token);
      } else if (!isAuthenticated()) {
        throw new Error('Authentication required to access profile');
      }

      const response = await this.api.get<Profile>('/v1/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: UpdateProfileRequest, token?: string): Promise<Profile> {
    try {
      if (token) {
        setAuthToken(token);
      } else if (!isAuthenticated()) {
        throw new Error('Authentication required to update profile');
      }
      const response = await this.api.put<Profile>('/v1/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService();
