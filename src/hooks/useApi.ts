import { useAuth } from '@clerk/clerk-react';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useCallback, useMemo } from 'react';
import { ApiError as BaseApiError } from '../types/api';
import { useProgressStore } from '../stores/progress.store';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token management
const TOKEN_KEY = 'auth_token';

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

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
  message: string;
}

const getTokenWithRetry = async (getToken: () => Promise<string | null>, retryCount = 3): Promise<string | null> => {
  for (let i = 0; i < retryCount; i++) {
    try {
      // First try to get token from storage
      let token = getStoredToken();
      if (!token) {
        // If no stored token, get a new one
        token = await getToken();
        if (token) {
          setStoredToken(token);
        }
      }
      return token;
    } catch (error) {
      console.error(`Error getting token (attempt ${i + 1}/${retryCount}):`, error);
      if (i === retryCount - 1) {
        throw error;
      }
      // Clear stored token on error
      setStoredToken(null);
    }
  }
  return null;
};

// Create an API instance that can be used outside of React components
export const createApi = (baseURL: string, getToken?: () => Promise<string | null>, onRequestStart?: () => void, onRequestEnd?: () => void) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Remove trailing slashes from URLs
  instance.interceptors.request.use((config) => {
    if (config.url) {
      // Remove trailing slash from the URL if it exists
      config.url = config.url.replace(/\/$/, '');
    }
    return config;
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        // Check if this is a protected route
        const isProtectedEndpoint = config.url?.includes('/v1/protected');

        if (isProtectedEndpoint) {
          const session = await window.Clerk?.session;
          if (!session) {
            console.warn('No Clerk session available for protected request');
            return Promise.reject(new Error('Authentication required'));
          }

          const token = await session.getToken({ template: 'AgistMe' });
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('No AgistMe JWT token available for protected request to:', config.url);
            return Promise.reject(new Error('Authentication required'));
          }
        } else {
          // For non-protected routes, try to add auth if available
          try {
            const session = await window.Clerk?.session;
            if (session) {
              const token = await session.getToken({ template: 'AgistMe' });
              if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            // Continue without auth for non-protected routes
            console.warn('Failed to get optional auth token:', error);
          }
        }

        onRequestStart?.();
        return config;
      } catch (error) {
        console.error('Error in request interceptor:', error);
        return Promise.reject(error);
      }
    },
    (error) => {
      console.error('Request interceptor error:', error);
      onRequestEnd?.();
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      onRequestEnd?.();
      return response;
    },
    async (error: AxiosError) => {
      console.log('Response error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      });

      if (error.response?.status === 401 && getToken && error.config) {
        try {
          console.log('Attempting to refresh token after 401');
          // Clear stored token on 401
          setStoredToken(null);
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

      onRequestEnd?.();
      throw {
        url: error.config?.url || '',
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        body: error.response?.data,
        message: error.message || 'An error occurred'
      } as ApiError;
    }
  );

  return instance;
};

export const useApi = () => {
  const { getToken } = useAuth();
  const { increment, decrement } = useProgressStore();

  const api: AxiosInstance = useMemo(() => {
    return createApi(
      API_BASE_URL,
      async () => {
        try {
          const session = await window.Clerk?.session;
          if (!session) {
            console.warn('No Clerk session available for protected request');
            return null;
          }

          const token = await session.getToken({ template: 'AgistMe' });
          console.log('Token obtained in useApi:', token ? 'Token present' : 'No token');
          return token;
        } catch (error) {
          console.error('Error getting auth token in useApi:', error);
          return null;
        }
      },
      increment,
      decrement
    );
  }, [getToken, increment, decrement]);

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
