import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';

export function AuthProfileManager() {
  const { isSignedIn, isLoaded } = useAuth();
  const { refreshProfile, clearProfile, profile } = useProfile();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && !profile) {
        // Load profile when signed in and no profile exists
        refreshProfile().catch((error) => {
          console.error('Failed to load profile after retries:', error);
          // Clear any existing retry timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
        });
      } else if (!isSignedIn && profile) {
        // Clear profile when signed out but profile still exists
        clearProfile();
      }
    }

    return () => {
      // Clean up any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isLoaded, isSignedIn, profile, refreshProfile, clearProfile]);

  return null; // This is a utility component that doesn't render anything
}
