import { useAuth } from '@clerk/clerk-react';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
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

const getTokenWithRetry = async (getToken: () => Promise<string | null>, retryCount = 3): Promise<string | null> => {
  for (let i = 0; i < retryCount; i++) {
    try {
      const token = await getToken();
      if (token) {
        return token;
      }
      console.warn(`Attempt ${i + 1}: Token is null`);
    } catch (error) {
      console.error(`Attempt ${i + 1}: Error getting token:`, error);
    }
    if (i < retryCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
  return null;
};

// Create an API instance that can be used outside of React components
export const createApi = (baseURL: string, getToken?: () => Promise<string | null>) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (getToken) {
        try {
          console.log('Getting token for request:', config.url);
          const token = await getTokenWithRetry(getToken);
          if (token && config.headers) {
            console.log('Token obtained successfully');
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('No token available for request');
          }
        } catch (error) {
          console.error('Error in request interceptor:', error);
        }
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      console.log('Response error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      });

      if (error.response?.status === 401 && getToken && error.config) {
        try {
          console.log('Attempting to refresh token after 401');
          const token = await getTokenWithRetry(getToken);
          
          if (token) {
            console.log('Token refreshed, retrying request');
            const newConfig = { ...error.config };
            newConfig.headers = newConfig.headers || {};
            newConfig.headers.Authorization = `Bearer ${token}`;
            
            // Create a new axios instance for the retry to avoid interceptor loop
            return axios(newConfig);
          } else {
            console.warn('Failed to get new token for retry');
          }
        } catch (refreshError) {
          console.error('Error during token refresh and retry:', refreshError);
        }
      }

      const apiError: ApiError = {
        message: error.message,
        url: error.config?.url || '',
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        body: error.response?.data,
      };
      return Promise.reject(apiError);
    }
  );

  return instance;
};

export const useApi = (baseURL: string) => {
  const { getToken } = useAuth();

  const api: AxiosInstance = useMemo(() => {
    return createApi(baseURL, async () => {
      try {
        const token = await getToken({ template: "AgistMe" });
        console.log('Token obtained in useApi:', token ? 'Token present' : 'No token');
        return token;
      } catch (error) {
        console.error('Error getting auth token in useApi:', error);
        return null;
      }
    });
  }, [baseURL, getToken]);

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
