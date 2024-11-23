import { useState, useEffect } from 'react';
import { Profile } from '../types/profile';
import type { UserResource } from '@clerk/types';
import { profileService } from '../services/profile.service';

export const useProfileForm = (user: UserResource | null | undefined) => {
  const [formData, setFormData] = useState<Profile>({
    id: '',
    firstName: '',
    lastName: '',
    mobile: '',
    profilePhoto: '',
    address: '',
    postcode: '',
    suburb: '',
    state: '',
    region: '',
    suburbId: '',
    geohash: '',
    horses: [],
    email: '',
    lastUpdate: '',
    dateOfBirth: '',
    comments: ''
  });

  const [originalData, setOriginalData] = useState<Profile | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingHorseIndex, setUploadingHorseIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const profileData = await profileService.getProfile();
          const newFormData = {
            id: profileData.id || '',
            firstName: profileData.firstName || user.firstName || '',
            lastName: profileData.lastName || user.lastName || '',
            mobile: profileData.mobile || '',
            profilePhoto: profileData.profilePhoto || '',
            address: profileData.address || '',
            postcode: profileData.postcode || '',
            suburb: profileData.suburb ? (typeof profileData.suburb === 'object' ? profileData.suburb.suburb : profileData.suburb) : '',  
            state: profileData.state || '',
            region: profileData.region || '',
            suburbId: profileData.suburbId || '',
            geohash: profileData.geohash || '',
            horses: profileData.horses || [],
            email: profileData.email || user.primaryEmailAddress?.emailAddress || '',
            lastUpdate: profileData.lastUpdate || '',
            dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
            comments: profileData.comments || ''
          };
          setFormData(newFormData);
          setOriginalData(newFormData);
          setIsDirty(false);
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const checkIfDirty = (newData: Profile) => {
    if (!originalData) return false;
    
    // Compare each field except lastUpdate
    const fieldsToCompare = Object.keys(newData).filter(key => key !== 'lastUpdate');
    return fieldsToCompare.some(key => {
      const field = key as keyof Profile;
      if (field === 'horses') {
        return JSON.stringify(newData[field]) !== JSON.stringify(originalData[field]);
      }
      return newData[field] !== originalData[field];
    });
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      setIsDirty(checkIfDirty(newData));
      return newData;
    });
  };

  const handleHorseChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const horses = prev.horses || [];
      const newHorses = horses.map((horse, i) =>
        i === index ? { ...horse, [field]: value } : horse
      );
      const newData = { ...prev, horses: newHorses };
      setIsDirty(checkIfDirty(newData));
      return newData;
    });
  };

  const handleProfilePhotoUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const s3Url = await profileService.uploadProfilePhoto(file);
      setFormData(prev => {
        const newData = { ...prev, profilePhoto: s3Url };
        setIsDirty(checkIfDirty(newData));
        return newData;
      });
      return s3Url;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await profileService.updateProfile(formData);
      setOriginalData(updatedProfile);
      setIsDirty(false);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    isSaving,
    isUploading,
    isLoading,
    isDirty,
    uploadingHorseIndex,
    setUploadingHorseIndex,
    handleInputChange,
    handleHorseChange,
    handleProfilePhotoUpload,
    saveProfile
  };
};
