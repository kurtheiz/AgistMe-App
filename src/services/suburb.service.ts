import { createApi } from '../hooks/useApi';
import { SuburbResponse } from '../types/generated/models/SuburbResponse';
import { getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class SuburbService {
  private api = createApi(API_BASE_URL, getAuthToken);

  async searchSuburbs(query: string, limit: number = 10, includeRegions: boolean = false): Promise<SuburbResponse> {
    try {
      const response = await this.api.get<SuburbResponse>('/v1/suburbs/search', {
        params: {
          query,
          limit,
          regions: includeRegions
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search suburbs:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const suburbService = new SuburbService();
