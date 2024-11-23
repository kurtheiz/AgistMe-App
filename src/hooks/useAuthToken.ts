import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';

const TOKEN_KEY = 'auth_token';

export const useAuthToken = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenUpdateInProgress = useRef(false);
  const [token, setToken] = useState<string | null>(null);

  // Helper functions for token management
  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
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

        // If not signed in, clear token
        if (!isSignedIn) {
          setAuthToken(null);
          setToken(null);
          return;
        }

        // Get new token only if we don't have one
        const currentToken = getAuthToken();
        if (!currentToken) {
          const newToken = await getToken({ template: "AgistMe" });
          if (newToken) {
            setAuthToken(newToken);
            setToken(newToken);
          }
        } else {
          setToken(currentToken);
        }
      } finally {
        tokenUpdateInProgress.current = false;
      }
    };

    updateToken();
  }, [getToken, isLoaded, isSignedIn]);

  return { token, setAuthToken };
};
