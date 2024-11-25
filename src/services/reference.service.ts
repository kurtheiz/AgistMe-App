import { createApi, API_BASE_URL } from '../hooks/useApi';
import type { ReferenceData } from '../types/reference';

class ReferenceService {
  private api;

  constructor() {
    this.api = createApi(API_BASE_URL);
  }

  async getReferenceData(): Promise<ReferenceData> {
    try {
      const response = await this.api.get<ReferenceData>('/v1/rd');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      throw error;
    }
  }
}

export const referenceService = new ReferenceService();
