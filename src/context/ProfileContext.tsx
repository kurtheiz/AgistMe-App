import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Profile } from '../types/profile';
import { profileService } from '../services/profile.service';
import { setAuthToken } from '../services/auth';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: (force: boolean) => Promise<void>;
  updateProfileData: (newProfile: Profile) => void;
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
    if (loading) return; // Prevent concurrent refreshes
    if (!force && profile && (now - lastFetch < CACHE_DURATION)) {
      // Use cached data if it's fresh enough
      return;
    }
    
    // If we've hit the retry limit and there's an error, don't try again
    if (error && retryCount >= MAX_RETRIES) {
      console.warn('Max retries reached, not attempting to refresh profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setLastFetch(now);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      setRetryCount(prev => prev + 1);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
      throw err; // Re-throw to let components handle the error
    } finally {
      setLoading(false);
    }
  }, [loading, profile, lastFetch, error, retryCount]);

  const updateProfileData = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
    setLastFetch(Date.now());
    setRetryCount(0); // Reset retry count when profile is manually updated
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
