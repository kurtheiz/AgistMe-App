import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import { Roles } from '../types/globals';

const TOKEN_KEY = 'auth_token';

export interface AuthState {
  token: string | null;
  role: Roles | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  setAuthToken: (token: string | null) => void;
}

export const useAuthToken = (): AuthState => {
  const { getToken, isLoaded, isSignedIn, sessionClaims } = useAuth();
  const tokenUpdateInProgress = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Roles | null>(null);

  // Helper functions for token management
  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setToken(token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  useEffect(() => {
    const updateToken = async () => {
      if (!isLoaded || tokenUpdateInProgress.current) return;

      try {
        tokenUpdateInProgress.current = true;

        // If not signed in, clear token and role
        if (!isSignedIn) {
          setAuthToken(null);
          setRole(null);
          return;
        }

        // Get new token only if we don't have one
        const currentToken = getAuthToken();
        if (!currentToken) {
          const newToken = await getToken({ template: "AgistMe" });
          if (newToken) {
            setAuthToken(newToken);
          }
        } else {
          setToken(currentToken);
        }

        // Update role from session claims
        const userRole = sessionClaims?.metadata?.role as Roles | undefined;
        setRole(userRole || null);
      } finally {
        tokenUpdateInProgress.current = false;
      }
    };

    updateToken();
  }, [isLoaded, isSignedIn, getToken, sessionClaims]);

  return {
    token,
    role,
    isLoaded,
    isSignedIn,
    setAuthToken
  };
};
