import { create } from 'zustand';
import { profileService } from '../services/profile.service';
import { Profile, ProfileResponse } from '../types/profile';
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface BioState {
  bio: Profile | null;
  isLoading: boolean;
  setBio: (bio: Profile) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateBio: (bioData: Partial<Profile>, queryClient?: QueryClient) => Promise<ProfileResponse>;
  uploadProfilePhoto: (file: File, queryClient?: QueryClient) => Promise<string>;
}

export const useBioStore = create<BioState>((set, get) => ({
  bio: null,
  isLoading: false,
  setBio: (bio) => set({ bio }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateBio: async (bioData: Partial<Profile>, queryClient?: QueryClient) => {
    try {
      const updatedProfile = await profileService.updateProfile({
        ...bioData,
        showProfileInEnquiry: bioData.showProfileInEnquiry ?? false
      });
      set({ bio: updatedProfile });

      if (queryClient) {
        queryClient.setQueryData(['profile'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            ...updatedProfile
          };
        });
      }

      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },
  uploadProfilePhoto: async (file: File, queryClient?: QueryClient) => {
    try {
      const url = await profileService.uploadProfilePhoto(file);
      const currentBio = get().bio;
      if (currentBio) {
        const updatedBio = { ...currentBio, profilePhoto: url };
        set({ bio: updatedBio });

        if (queryClient) {
          queryClient.setQueryData(['profile'], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...updatedBio
            };
          });
        }
      }
      return url;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
      throw error;
    }
  }
}));
