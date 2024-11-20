import { OpenAPI } from '../types/generated/core/OpenAPI';

// In-memory token cache
let authToken: string | null = null;

// Initialize token from localStorage on module load
authToken = localStorage.getItem('auth_token');
if (authToken) {
  OpenAPI.TOKEN = authToken;
  OpenAPI.HEADERS = {
    'Authorization': `Bearer ${authToken}`
  };
}

export const setAuthToken = (token: string | null) => {
  // If token hasn't changed, do nothing
  if (token === authToken) return;

  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
    OpenAPI.TOKEN = token;
    OpenAPI.HEADERS = {
      'Authorization': `Bearer ${token}`
    };
  } else {
    localStorage.removeItem('auth_token');
    OpenAPI.TOKEN = undefined;
    OpenAPI.HEADERS = undefined;
  }
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const isAuthenticated = (): boolean => {
  return !!authToken;
};
