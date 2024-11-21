import { createApi } from '../hooks/useApi';
import { SuburbResponse } from '../types/suburb';
import { getAuthToken } from './auth';
import { AUSTRALIAN_STATES } from '../utils/australianStates';

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

      if (includeRegions) {
        // If the query matches any state name or abbreviation, include matching states
        const normalizedQuery = query.toLowerCase();
        const matchingStates = AUSTRALIAN_STATES.filter(state => 
          state.state.toLowerCase().includes(normalizedQuery) || 
          state.suburb.toLowerCase().includes(normalizedQuery)
        );

        if (matchingStates.length > 0) {
          return {
            suburbs: [...matchingStates, ...(response.data.suburbs || [])],
            count: (response.data.count || 0) + matchingStates.length
          };
        }
      }

      return response.data;
    } catch (error) {
      console.error('Failed to search suburbs:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const suburbService = new SuburbService();
