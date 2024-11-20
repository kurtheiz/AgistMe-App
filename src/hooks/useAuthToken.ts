import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { setAuthToken, getAuthToken } from '../services/auth';

export const useAuthToken = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenUpdateInProgress = useRef(false);

  useEffect(() => {
    const updateToken = async () => {
      if (!isLoaded || tokenUpdateInProgress.current) return;

      try {
        tokenUpdateInProgress.current = true;

        // If not signed in, clear token
        if (!isSignedIn) {
          setAuthToken(null);
          return;
        }

        // Get new token only if we don't have one
        if (!getAuthToken()) {
          const token = await getToken({ template: "AgistMe" });
          if (token) {
            setAuthToken(token);
          }
        }
      } finally {
        tokenUpdateInProgress.current = false;
      }
    };

    updateToken();
  }, [getToken, isLoaded, isSignedIn]);
};
