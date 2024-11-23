import { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { useProfile } from '../context/ProfileContext';
import { CheckIcon, ArrowLeftIcon } from './Icons';
import { ProfilePhoto } from './Profile/ProfilePhoto';
import { ProfileSkeleton } from './Profile/ProfileSkeleton';
import { PageToolbar } from './PageToolbar';
import { profileService } from '../services/profile.service';
import { Profile, UpdateProfileRequest } from '../types/profile';

export default function Bio() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [originalData, setOriginalData] = useState<Partial<Profile>>({});
  const [formData, setFormData] = useState<Partial<Profile>>({
    firstName: '',
    lastName: '',
    comments: '',
    profilePhoto: '',
    mobile: '',
    dateOfBirth: '',
    address: '',
    suburb: '',
    state: '',
    postcode: '',
    geohash: '',
    suburbId: '',
    region: ''
  });

  // Track if there are any changes to save
  const hasChanges = useMemo(() => {
    return Object.keys(formData).some(key => {
      const formValue = formData[key as keyof typeof formData];
      const originalValue = originalData[key as keyof typeof originalData];
      return formValue !== originalValue;
    });
  }, [formData, originalData]);

  useEffect(() => {
    if (profile) {
      const initialData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        comments: profile.comments !== null ? profile.comments : '',
        profilePhoto: profile.profilePhoto || '',
        mobile: profile.mobile || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        suburb: profile.suburb || '',
        state: profile.state || '',
        postcode: profile.postcode || '',
        geohash: profile.geohash || '',
        suburbId: profile.suburbId || '',
        region: profile.region || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [profile]);

  // If profile is not loaded yet, try to load it
  if (isLoaded && isSignedIn && !profile && !loading && !error) {
    refreshProfile(true);
  }

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        region: formData.region
      } as UpdateProfileRequest);
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

    if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <PageToolbar 
        actions={
          <div className="w-full flex items-center -ml-1 sm:-ml-3">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium text-sm">Back</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-600 mx-1">|</span>
              <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Profile</span>
                <span className="text-neutral-300 dark:text-neutral-600">&gt;</span>
                <span>Bio</span>
              </div>
            </div>
          </div>
        }
      />
      
      <div className="w-full pb-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          <div className="py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">Bio Settings</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your personal information
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-4 sm:p-6">
            <form onSubmit={handleSubmit} id="profile-form" className="space-y-4 sm:space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
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
                  fallbackUrl={user?.imageUrl || '/default-profile.png'}
                />
              </div>

              {/* Email Display */}
              <div className="text-center mb-4">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Email:</span>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="form-input h-10 text-sm w-full"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="form-input h-10 text-sm w-full"
                  />
                </div>
              </div>

              {/* Date of Birth and Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={getMaxDateOfBirth()}
                    min={getMinDateOfBirth()}
                    className="form-input h-10 text-sm w-full [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  {formData.dateOfBirth && !isValidDateOfBirth(formData.dateOfBirth).isValid && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {isValidDateOfBirth(formData.dateOfBirth).error}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Mobile Number"
                    className="form-input h-10 text-sm w-full"
                  />
                  {formData.mobile && !isValidAusMobileNumber(formData.mobile) && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      Please enter a valid mobile number (xxxx-xxx-xxx)
                    </p>
                  )}
                </div>
              </div>

              {/* Suburb Search Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Search Suburb
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        address: '',
                        suburb: '',
                        state: '',
                        postcode: '',
                        geohash: '',
                        suburbId: '',
                        region: ''
                      }));
                    }}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Address
                  </button>
                </div>
                <SuburbSearch
                  selectedSuburbs={formData.suburb && typeof formData.suburb !== 'string' ? [formData.suburb] : []}
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
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      readOnly
                      className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Post Code
                    </label>
                    <input
                      type="text"
                      value={formData.postcode}
                      readOnly
                      className="form-input h-10 text-sm w-full bg-neutral-100 dark:bg-neutral-800"
                    />
                  </div>
                </div>
                {/* Address Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="form-input h-10 text-sm w-full"
                  />
                </div>
                {/* Comments Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    About
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments || ''}
                    onChange={handleInputChange}
                    placeholder={`Tell us more about ${formData.firstName || 'yourself'}`}
                    rows={3}
                    className="form-textarea text-sm w-full resize-none"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-3">
        <div className="max-w-2xl mx-auto">
          <button
            type="submit"
            form="profile-form"
            disabled={saving || !hasChanges || isUploading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 disabled:cursor-not-allowed rounded-lg"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Uploading Photo...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5" />
                <span>{hasChanges ? 'Save Changes' : 'No Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
