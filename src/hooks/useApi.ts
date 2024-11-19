import { useAuth } from '@clerk/clerk-react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useCallback, useMemo } from 'react';
import { ApiError as BaseApiError } from '../types/api';

// Generic API Response type that works with our generated types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Extend the base ApiError type
export interface ApiError extends BaseApiError {
  url: string;
  status: number;
  statusText: string;
  body: unknown;
}

export const useApi = (baseURL: string) => {
  const { getToken } = useAuth();

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Error getting auth token:', error);
          return config;
        }
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          url: error.config?.url || 'unknown',
          status: error.response?.status || 500,
          statusText: error.response?.statusText || 'Internal Server Error',
          body: error.response?.data || {},
        };
        return Promise.reject(apiError);
      }
    );

    return instance;
  }, [getToken]);

  const get = useCallback(async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await api.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
    };
  }, [api]);

  const post = useCallback(async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await api.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  }, [api]);

  const put = useCallback(async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await api.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  }, [api]);

  const del = useCallback(async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
    };
  }, [api]);

  return {
    get,
    post,
    put,
    delete: del,
  };
};
