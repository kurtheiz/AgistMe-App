import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Profile, UpdateProfileRequest } from '../types/profile';
import { profileService } from '../services/profile.service';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isUpdating: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: UpdateProfileRequest) => Promise<void>;
  clearProfile: () => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshProfile = useCallback(async () => {
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
  }, []);

  const updateProfileData = useCallback(async (data: UpdateProfileRequest) => {
    setIsUpdating(true);
    try {
      const updatedProfile = await profileService.updateProfile(data);
      
      // Ensure we properly merge the profile data
      setProfile(prev => {
        if (!prev) return updatedProfile;
        
        return {
          ...prev,
          ...updatedProfile,
          // Preserve agistor status if not explicitly changed
          agistor: 'agistor' in data ? data.agistor : prev.agistor,
          // Ensure we merge arrays instead of replacing them
          favourites: updatedProfile.favourites || prev.favourites || [],
          horses: updatedProfile.horses || prev.horses || [],
          savedSearches: updatedProfile.savedSearches || prev.savedSearches || [],
          myAgistments: updatedProfile.myAgistments || prev.myAgistments || []
        };
      });

      // Refresh profile to ensure we have the latest data
      await refreshProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshProfile]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return (
    <ProfileContext.Provider 
      value={{ 
        profile, 
        loading, 
        error,
        isUpdating,
        refreshProfile,
        updateProfileData,
        clearProfile
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
