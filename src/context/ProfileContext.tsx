import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Profile, UpdateProfileRequest } from '../types/profile';
import { profileService } from '../services/profile.service';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: (force: boolean) => Promise<void>;
  updateProfileData: (data: UpdateProfileRequest) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const MAX_RETRIES = 3;

  const refreshProfile = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    
    // Use state updater functions to access latest state values
    setLoading(prevLoading => {
      if (prevLoading) return prevLoading; // Prevent concurrent refreshes
      
      // Wrap the entire operation in the loading state updater
      (async () => {
        try {
          const profileData = await profileService.getProfile();
          setProfile(profileData);
          setLastFetch(now);
          setRetryCount(0); // Reset retry count on success
          setError(null);
        } catch (err) {
          setRetryCount(prev => {
            const newCount = prev + 1;
            if (newCount >= MAX_RETRIES) {
              console.warn('Max retries reached, not attempting to refresh profile');
            }
            return newCount;
          });
          const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
          setError(errorMessage);
          console.error('Error loading profile:', err);
          throw err;
        } finally {
          setLoading(false);
        }
      })();
      
      return true; // Set loading to true
    });
  }, []); // No dependencies needed as we use state updaters

  const updateProfileData = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      setLastFetch(Date.now());
      setRetryCount(0); // Reset retry count when profile is manually updated
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  return (
    <ProfileContext.Provider 
      value={{ 
        profile, 
        loading, 
        error, 
        refreshProfile,
        updateProfileData
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
