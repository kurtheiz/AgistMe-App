import { createApi, API_BASE_URL } from '../hooks/useApi';
import { Agistment, AgistmentResponse } from '../types/agistment';

class AgistmentService {
  private api;

  constructor() {
    this.api = createApi(API_BASE_URL);
  }

  async searchAgistments(searchHash: string): Promise<AgistmentResponse> {
    try {
      const response = await this.api.get<AgistmentResponse>(`/v1/agistments?q=${searchHash}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to search agistments:', error);
      throw error;
    }
  }

  async getAgistment(id: string): Promise<Agistment> {
    try {
      const response = await this.api.get<Agistment>(`/v1/agistments/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to get agistment ${id}:`, error);
      throw error;
    }
  }

  async createAgistment(agistment: Partial<Agistment>): Promise<Agistment> {
    try {
      const response = await this.api.post<Agistment>('/v1/protected/agistments/create', agistment);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to create agistment:', error);
      throw error;
    }
  }

  async updateAgistment(id: string, agistment: Partial<Agistment>): Promise<Agistment> {
    try {
      const response = await this.api.put<Agistment>(`/v1/protected/agistments/${id}`, agistment);
      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to update agistment ${id}:`, error);
      throw error;
    }
  }

  async deleteAgistment(id: string): Promise<void> {
    try {
      await this.api.delete(`/v1/protected/agistments/${id}`);
    } catch (error: unknown) {
      console.error(`Failed to delete agistment ${id}:`, error);
      throw error;
    }
  }

  async getMyAgistments(): Promise<AgistmentResponse> {
    try {
      const response = await this.api.get<AgistmentResponse>('/v1/protected/agistments/me');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get my agistments:', error);
      throw error;
    }
  }

  async getFeaturedAgistments(): Promise<AgistmentResponse> {
    try {
      const response = await this.api.get<AgistmentResponse>('/v1/agistments/featured');
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get featured agistments:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const agistmentService = new AgistmentService();
