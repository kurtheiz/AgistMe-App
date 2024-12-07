import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import { Roles } from '../types/globals';

const TOKEN_KEY = 'auth_token';

export interface AuthState {
  token: string | null;
  role: Roles | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isValidating: boolean;
  setAuthToken: (token: string | null) => void;
}

// Helper function to parse JWT token
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return {};
  }
};

export const useAuthToken = (): AuthState => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const tokenUpdateInProgress = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Roles | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Helper functions for token management
  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(token);
  };

  useEffect(() => {
    const updateToken = async () => {
      // Skip if already updating token
      if (tokenUpdateInProgress.current) {
        return;
      }

      try {
        tokenUpdateInProgress.current = true;
        setIsValidating(true);

        // If not signed in, clear token and role
        if (!isSignedIn) {
          setToken(null);
          setRole(null);
          return;
        }

        // Get token from Clerk
        const token = await getToken();
        setToken(token);

        // Get role from token claims
        const userRole = token ? parseJwt(token).role : null;
        setRole(userRole || null);
      } finally {
        tokenUpdateInProgress.current = false;
        setIsValidating(false);
      }
    };

    updateToken();
  }, [isSignedIn, isLoaded, getToken]);

  return {
    token,
    role,
    isLoaded: isLoaded || false,
    isSignedIn: isSignedIn || false,
    isValidating,
    setAuthToken
  };
};
