import { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { useProfile } from '../context/ProfileContext';
import { ProfilePhoto } from './Profile/ProfilePhoto';
import { profileService } from '../services/profile.service';
import { Profile, UpdateProfileRequest } from '../types/profile';
import { Modal } from './shared/Modal';

interface BioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  clearFields?: boolean;
}

export default function Bio({ isOpen = false, onClose = () => { }, clearFields = false }: BioModalProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [originalData, setOriginalData] = useState<Partial<Profile>>({});
  const [formData, setFormData] = useState<Partial<Profile>>({});

  // Initialize form data only when profile changes or clearFields is toggled
  useEffect(() => {
    if (!profile) return;

    const newFormData = clearFields ? {
      id: profile.id,
      email: profile.email,
      shareId: profile.shareId,
      showProfileInEnquiry: false,
      lastUpdate: new Date().toISOString()
    } : {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      comments: profile.comments !== null ? profile.comments : '',
      profilePhoto: profile.profilePhoto || '',
      mobile: profile.mobile || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      suburb: profile.suburb || '',
      postcode: profile.postcode || '',
      geohash: profile.geohash || '',
      suburbId: profile.suburbId || '',
      region: profile.region || '',
      state: profile.state || '',
      showProfileInEnquiry: profile.showProfileInEnquiry || false
    };

    setFormData(newFormData);
    setOriginalData(newFormData);
  }, [profile, clearFields]);

  // Track if there are any changes to save
  const hasChanges = useMemo(() => {
    return Object.keys(formData).some(key => {
      const formValue = formData[key as keyof typeof formData];
      const originalValue = originalData[key as keyof typeof originalData];
      return formValue !== originalValue;
    });
  }, [formData, originalData]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !profile && !loading && !error) {
      refreshProfile();
    }
  }, [isLoaded, isSignedIn, profile, loading, error, refreshProfile]);

  const handleClose = () => {
    setFormData(originalData); // Reset form data to original state
    onClose();
  };

  if (!isLoaded || !isSignedIn || loading) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasChanges || saving || isUploading) return;
    try {
      setSaving(true);

      await updateProfileData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        comments: formData.comments,
        profilePhoto: formData.profilePhoto,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        suburb: formData.suburb,
        state: formData.state,
        postcode: formData.postcode,
        geohash: formData.geohash,
        suburbId: formData.suburbId,
        region: formData.region,
        showProfileInEnquiry: formData.showProfileInEnquiry
      } as UpdateProfileRequest);

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearAddress = () => {
    setFormData(prev => ({
      ...prev,
      address: '',
      suburb: '',
      postcode: '',
      region: '',
      state: '',
      suburbId: '',
      geohash: ''
    }));
  };

  const handleClearBio = () => {
    setFormData({
      ...profile,
      firstName: '',
      lastName: '',
      comments: '',
      profilePhoto: '',
      mobile: '',
      dateOfBirth: '',
      address: '',
      suburb: '',
      postcode: '',
      geohash: '',
      suburbId: '',
      region: '',
      state: '',
      showProfileInEnquiry: false
    });
  };

  const modalContent = (
    <form id="bio-form" onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e);
    }} className="space-y-4">
      {/* Privacy Settings */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-neutral-900 dark:text-white">
            Privacy Settings
          </h4>
          <button
            type="button"
            onClick={handleClearBio}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Clear Bio
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showProfileInEnquiry}
              onChange={(e) => !clearFields && setFormData(prev => ({ ...prev, showProfileInEnquiry: e.target.checked }))}
              disabled={clearFields}
              className={`sr-only peer ${clearFields ? 'cursor-not-allowed' : ''}`}
            />
            <div className={`w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-offset-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600 ${clearFields ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            <span className={`ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 ${clearFields ? 'opacity-50 cursor-not-allowed' : ''}`}>Share my bio with agistors</span>
          </label>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-[3.5rem]">
            When enabled, your bio and horse information will be shared with agistors you've made an enquiry with, so they can better understand you and your horses.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[240px]">
          <ProfilePhoto
            photoUrl={formData.profilePhoto || ''}
            isUploading={isUploading}
            onPhotoUpload={async (file: File) => {
              try {
                setIsUploading(true);
                const photoUrl = await profileService.uploadProfilePhoto(file);
                setFormData(prev => ({
                  ...prev,
                  profilePhoto: photoUrl
                }));
                return photoUrl;
              } catch (error) {
                console.error('Error uploading photo:', error);
                return '';
              } finally {
                setIsUploading(false);
              }
            }}
            onPhotoRemove={() => {
              setFormData(prev => ({
                ...prev,
                profilePhoto: ''
              }));
            }}
            disabled={clearFields}
          />
        </div>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
        {user?.primaryEmailAddress?.emailAddress}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            First Name
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              disabled={clearFields}
              className={`form-input h-10 text-sm w-full ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            />
            <button
              type="button"
              className="input-delete-button"
              onClick={() => setFormData(prev => ({ ...prev, firstName: '' }))}
              aria-label="Clear first name"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Last Name
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              disabled={clearFields}
              className={`form-input h-10 text-sm w-full ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            />
            <button
              type="button"
              className="input-delete-button"
              onClick={() => setFormData(prev => ({ ...prev, lastName: '' }))}
              aria-label="Clear last name"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Date of Birth
          </label>
          <div className="input-wrapper">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              max={getMaxDateOfBirth()}
              min={getMinDateOfBirth()}
              disabled={clearFields}
              className={`form-input h-10 text-sm w-full dark:[color-scheme:dark] ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            />
            <button
              type="button"
              className="input-delete-button"
              onClick={() => setFormData(prev => ({ ...prev, dateOfBirth: '' }))}
              aria-label="Clear date of birth"
            >
              ✕
            </button>
          </div>
          {formData.dateOfBirth && !isValidDateOfBirth(formData.dateOfBirth).isValid && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {isValidDateOfBirth(formData.dateOfBirth).error}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="mobile" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Mobile Number
          </label>
          <div className="input-wrapper">
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              disabled={clearFields}
              className={`form-input h-10 text-sm w-full ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
            />
            <button
              type="button"
              className="input-delete-button"
              onClick={() => setFormData(prev => ({ ...prev, mobile: '' }))}
              aria-label="Clear mobile number"
            >
              ✕
            </button>
          </div>
          {formData.mobile && !isValidAusMobileNumber(formData.mobile) && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Please enter a valid mobile number (xxxx-xxx-xxx)
            </p>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Location
          </label>
          <button
            type="button"
            onClick={handleClearAddress}
            disabled={!formData.postcode && !formData.address && !formData.suburb}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Address
          </button>
        </div>

        {/* Suburb Search and Address */}
        <div className="grid grid-cols-1 gap-4 items-start">
          <div className="w-full">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Address
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={clearFields}
                className={`form-input h-10 text-sm w-full ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
              />
              <button
                type="button"
                className="input-delete-button"
                onClick={() => setFormData(prev => ({ ...prev, address: '' }))}
                aria-label="Clear address"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Suburb
            </label>
            <SuburbSearch
              selectedSuburbs={[]}
              onSuburbsChange={(suburbs) => {
                const suburb = suburbs[0];
                if (suburb) {
                  setFormData(prev => ({
                    ...prev,
                    suburb: suburb.suburb,
                    state: suburb.state,
                    postcode: suburb.postcode,
                    suburbId: suburb.id,
                    region: suburb.region || '',
                    geohash: suburb.geohash || ''
                  }));
                }
              }}
              multiple={false}
              disabled={clearFields}
              className={`${clearFields ? 'opacity-50' : ''}`}
            />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Selected Suburb
                </label>
                <input
                  type="text"
                  value={formData.suburb ? `${formData.suburb}, ${formData.state} ${formData.postcode}` : ''}
                  readOnly
                  disabled
                  className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region || ''}
                  readOnly
                  disabled
                  className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* State and Postcode */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              readOnly
              disabled
              className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Post Code
            </label>
            <input
              type="text"
              value={formData.postcode}
              readOnly
              disabled
              className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
            />
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            About
          </label>
          <textarea
            name="comments"
            value={formData.comments || ''}
            onChange={handleInputChange}
            placeholder={'Tell agistors more about yourself'}
            rows={7}
            disabled={clearFields}
            className={`form-textarea text-sm w-full resize-none ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
          />
        </div>
      </div>
    </form>
  );

  const footerContent = (
    <div className="flex justify-center space-x-2">
      <button
        type="submit"
        form="bio-form"
        disabled={!hasChanges || saving || isUploading}
        className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
          !hasChanges || saving || isUploading
            ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
            : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
        }`}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      size="lg"
      footerContent={footerContent}
      slideFrom='left'
      isUpdating={saving}
    >
      <div className="px-4 py-3">
        {modalContent}
      </div>
    </Modal>
  );
}
