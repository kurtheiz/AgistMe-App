import { OpenAPI } from '../types/generated/core/OpenAPI';

class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static setAuthToken(token: string | null) {
    if (token) {
      console.log('Setting auth token:', token);
      localStorage.setItem(this.TOKEN_KEY, token);
      OpenAPI.TOKEN = token;
      OpenAPI.HEADERS = {
        'Authorization': `Bearer ${token}`
      };
    } else {
      console.log('Clearing auth token');
      localStorage.removeItem(this.TOKEN_KEY);
      OpenAPI.TOKEN = undefined;
      OpenAPI.HEADERS = undefined;
    }
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static initializeAuth() {
    const token = this.getAuthToken();
    if (token) {
      console.log('Initializing with stored token:', token);
      this.setAuthToken(token);
    } else {
      console.log('No stored token found');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  static clearAuth() {
    this.setAuthToken(null);
  }
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
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
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

export const isAuthenticated = (): boolean => {
  return !!(authToken || localStorage.getItem('auth_token'));
};

export default AuthService;
