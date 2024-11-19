import { ApiService } from './api';
import { SuburbResponse } from '../types/generated';
import { ApiResponse } from './api';

export class SuburbsService extends ApiService {
  constructor() {
    super('http://127.0.0.1:8000'); // Your API base URL
  }

  /**
   * Search suburbs with typeahead functionality
   * @param query Search query (minimum 2 characters)
   * @param limit Maximum number of results (1-50, default 10)
   * @param includeRegions Whether to include regions in the search results (default true)
   */
  async searchSuburbs(
    query: string,
    limit: number = 10,
    includeRegions: boolean = true
  ): Promise<ApiResponse<SuburbResponse>> {
    return this.get<SuburbResponse>('/v1/suburbs/search', {
      q: query,
      limit,
      regions: includeRegions,
    });
  }
}
