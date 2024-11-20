import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import { setAuthToken, getAuthToken } from '../services/auth';

export const useAuthToken = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenUpdateInProgress = useRef(false);
  const [token, setToken] = useState<string | null>(null);

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
        const currentToken = await getAuthToken();
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

  return { token };
};
