import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Profile, UpdateProfileRequest } from '../types/profile';
import { profileService } from '../services/profile.service';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: UpdateProfileRequest) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    // Wrap the entire operation in the loading state updater
    setLoading(true);
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as we use state updaters

  const updateProfileData = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
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
