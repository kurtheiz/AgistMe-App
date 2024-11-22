// Custom OpenAPI configuration
interface OpenAPI {
  TOKEN?: string;
  HEADERS?: Record<string, string>;
}

export const OpenAPI: OpenAPI = {};

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

export const getAuthToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('auth_token');
  if (token && token !== OpenAPI.TOKEN) {
    // Sync OpenAPI configuration if token exists but doesn't match
    OpenAPI.TOKEN = token;
    OpenAPI.HEADERS = {
      'Authorization': `Bearer ${token}`
    };
  }
  return token;
};

export const isAuthenticated = (): boolean => {
  return !!OpenAPI.TOKEN;
};

export default OpenAPI;
