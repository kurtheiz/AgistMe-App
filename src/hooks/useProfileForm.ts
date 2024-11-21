import { useState, useEffect } from 'react';
import { Profile } from '../types/profile';
import { User } from '@clerk/clerk-react';
import { profileService } from '../services/profile.service';
import { Suburb } from '../types/generated/models/Suburb';

export const useProfileForm = (user: User | null | undefined, profile: Profile | null) => {
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
  const [uploadingHorseIndex, setUploadingHorseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && profile) {
      const newFormData = {
        id: profile.id || '',
        firstName: profile.firstName || user.firstName || '',
        lastName: profile.lastName || user.lastName || '',
        mobile: profile.mobile || '',
        profilePhoto: profile.profilePhoto || user.imageUrl || '',
        address: profile.address || '',
        postcode: profile.postcode || '',
        suburb: profile.suburb || '',
        state: profile.state || '',
        region: profile.region || '',
        suburbId: profile.suburbId || '',
        geohash: profile.geohash || '',
        horses: profile.horses || [],
        email: profile.email || user.primaryEmailAddress?.emailAddress || '',
        lastUpdate: profile.lastUpdate || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        comments: profile.comments || ''
      };
      setFormData(newFormData);
      setOriginalData(newFormData);
      setIsDirty(false);
    }
  }, [user, profile]);

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
      const newHorses = prev.horses.map((horse, i) =>
        i === index ? { ...horse, [field]: value } : horse
      );
      const newData = { ...prev, horses: newHorses };
      setIsDirty(checkIfDirty(newData));
      return newData;
    });
  };

  const handleSuburbSelect = (suburbs: Suburb[]) => {
    if (suburbs.length > 0) {
      const suburb = suburbs[0];
      setFormData(prev => {
        const newData = {
          ...prev,
          suburb: suburb.suburb,
          state: suburb.state,
          region: suburb.region,
          postcode: suburb.postcode || '',
          geohash: suburb.geohash,
          suburbId: suburb.id
        };
        setIsDirty(checkIfDirty(newData));
        return newData;
      });
    }
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
    isDirty,
    uploadingHorseIndex,
    setUploadingHorseIndex,
    handleSuburbSelect,
    handleInputChange,
    handleHorseChange,
    handleProfilePhotoUpload,
    saveProfile
  };
};
