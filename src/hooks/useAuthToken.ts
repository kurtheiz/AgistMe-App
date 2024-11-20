import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthToken } from '../services/auth';

export const useAuthToken = () => {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      try {
        const token = await getToken({ template: "AgistMe" });
        setAuthToken(token);
      } catch (error) {
        console.error('Error getting auth token:', error);
        setAuthToken(null);
      }
    };

    if (isLoaded) {
      updateToken();
    }
  }, [getToken, isLoaded]);
};
