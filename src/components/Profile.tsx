import { useState, useRef, useEffect, useCallback } from 'react';
import { useClerk, useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { handlePhoneNumberChange, isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { Suburb } from '../types/generated/models/Suburb';
import { profileService } from '../services/profile.service';
import { Profile as ProfileType } from '../types/profile';
import { useProfile } from '../context/ProfileContext';
import { ProgressBar } from './ProgressBar';
import { ArrowRightOnRectangleIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuthToken } from '../hooks/useAuthToken';

export default function Profile() {
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const horsePhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingHorseIndex, setUploadingHorseIndex] = useState<number | null>(null);
  useAuthToken();

  const [formData, setFormData] = useState<ProfileType>({
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
    dateOfBirth: ''
  });

  useEffect(() => {
    if (user && profile) {
      setFormData({
        id: profile.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
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
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    
    // Only try to refresh profile if we're authenticated
    const loadProfile = async () => {
      try {
        await refreshProfile(false);
      } catch (err) {
        // If refresh fails, don't retry automatically
        console.error('Failed to load profile:', err);
      }
    };
    
    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const handleSuburbSelect = useCallback((suburbs: Suburb[]) => {
    if (suburbs.length > 0) {
      const suburb = suburbs[0];
      setFormData(prev => ({
        ...prev,
        suburb: suburb.suburb,
        state: suburb.state,
        region: suburb.region,
        postcode: suburb.postcode || '',
        geohash: suburb.geohash,
        suburbId: suburb.id
      }));
    }
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      handlePhoneNumberChange(value, (formattedValue) => {
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }));
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('Selected file:', file.name);

    try {
      setIsUploading(true);
      console.log('Starting file upload process...');

      // Upload the file and get the S3 URL
      const s3Url = await profileService.uploadProfilePhoto(file);
      console.log('File uploaded successfully, S3 URL:', s3Url);

      // Update the local state first for immediate feedback
      setFormData(prev => ({
        ...prev,
        profilePhoto: s3Url
      }));

      // Update the profile in the backend
      const { id, email, lastUpdate, ...updateData } = formData;
      updateData.profilePhoto = s3Url;
      console.log('Updating profile with new photo URL:', s3Url);
      const updatedProfile = await profileService.updateProfile(updateData);
      console.log('Profile updated successfully:', updatedProfile);
      
      // Update the global profile state
      updateProfileData(updatedProfile);
    } catch (error) {
      console.error('Error in image upload process:', error);
      alert('Failed to upload profile photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleHorsePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploadingHorseIndex === null) return;

    try {
      setIsUploading(true);
      const photoUrl = await profileService.uploadHorsePhoto(file, "horseName");
      
      setFormData(prev => ({
        ...prev,
        horses: prev.horses.map((horse, index) => 
          index === uploadingHorseIndex ? { ...horse, profilePhoto: photoUrl } : horse
        )
      }));
    } catch (error) {
      console.error('Error uploading horse photo:', error);
    } finally {
      setIsUploading(false);
      setUploadingHorseIndex(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      const { id, email, lastUpdate, ...updateData } = formData;
      
      console.log('Sending profile update:', updateData);
      const updatedProfile = await profileService.updateProfile(updateData);
      console.log('Received updated profile:', updatedProfile);
      updateProfileData(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (!isLoaded || loading) {
    return <ProgressBar />;
  }

  if (error) {
    return <div className="text-red-500">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info Panel */}
        <div className="bg-white dark:bg-neutral-900 rounded-none sm:rounded-xl shadow-lg p-2 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Contact Information</h2>
            <button
              onClick={handleSignOut}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="relative aspect-square w-full max-w-[240px] rounded-lg overflow-hidden transition-all duration-300">
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  <img
                    src={formData.profilePhoto || user?.imageUrl || '/default-profile.png'}
                    alt={user?.fullName || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      e.currentTarget.src = user?.imageUrl || '/default-profile.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center gap-4 transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-full bg-white bg-opacity-0 hover:bg-opacity-100 text-white hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </button>
                    {formData.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profilePhoto: '' }));
                        }}
                        className="p-1.5 rounded-full bg-white bg-opacity-0 hover:bg-opacity-100 text-white hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Email Display */}
            <div className="text-center">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Email:</span>
              <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="First Name"
                  className="h-[42px] w-full border-2 rounded-lg border-neutral-300 dark:border-neutral-600 bg-transparent px-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
              <div className="relative">
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Last Name"
                  className="h-[42px] w-full border-2 rounded-lg border-neutral-300 dark:border-neutral-600 bg-transparent px-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
            </div>

            {/* Date of Birth and Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
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
                  className="h-[42px] w-full border-2 rounded-lg border-neutral-300 dark:border-neutral-600 bg-transparent px-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 [color-scheme:light] dark:[color-scheme:dark]"
                />
                {formData.dateOfBirth && !isValidDateOfBirth(formData.dateOfBirth).isValid && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {isValidDateOfBirth(formData.dateOfBirth).error}
                  </p>
                )}
              </div>
              <div className="relative">
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
                  className="h-[42px] w-full border-2 rounded-lg border-neutral-300 dark:border-neutral-600 bg-transparent px-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                />
                {formData.mobile && !isValidAusMobileNumber(formData.mobile) && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    Please enter a valid mobile number (xxxx-xxx-xxx)
                  </p>
                )}
              </div>
            </div>

            {/* Suburb Search Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Search Suburb
              </label>
              <SuburbSearch
                onSelect={handleSuburbSelect}
                multiple={false}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Suburb</label>
                  <input
                    type="text"
                    value={formData.suburb}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Post Code</label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              </div>
              {/* Address Field - Full Width */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className={`bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isSaving ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - My Horses */}
        <div className="bg-white dark:bg-neutral-900 rounded-none sm:rounded-xl shadow-lg p-2 sm:p-8 md:block">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">My Horses</h2>
          </div>

          {/* Horses List */}
          <div className="space-y-6">
            {formData.horses.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                No horses added yet. Click "Add Horse" to get started.
              </p>
            ) : (
              formData.horses.map((horse, index) => (
                <div key={index} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 relative">
                  {/* Delete Button - Top Right */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <span className="sr-only">Delete</span>
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Horse Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Photo and Comments Only */}
                    <div className="flex flex-col h-full">
                      {/* Horse Photo */}
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={horsePhotoInputRef}
                          onChange={handleHorsePhotoUpload}
                        />
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 transition-all duration-300">
                          {isUploading && uploadingHorseIndex === index && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                          {horse.profilePhoto ? (
                            <img 
                              src={horse.profilePhoto} 
                              alt={horse.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PhotoIcon className="h-12 w-12 text-neutral-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center gap-4 transition-all duration-300">
                            <button
                              type="button"
                              onClick={() => {
                                setUploadingHorseIndex(index);
                                horsePhotoInputRef.current?.click();
                              }}
                              className="p-1.5 rounded-full bg-white bg-opacity-0 hover:bg-opacity-100 text-white hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <PencilSquareIcon className="h-6 w-6" />
                            </button>
                            {horse.profilePhoto && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedHorses = formData.horses.map((h, i) => 
                                    i === index ? { ...h, profilePhoto: '' } : h
                                  );
                                  setFormData(prev => ({ ...prev, horses: updatedHorses }));
                                }}
                                className="p-1.5 rounded-full bg-white bg-opacity-0 hover:bg-opacity-100 text-white hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments Section - Same width as photo */}
                      <div className="flex-1 flex flex-col mt-4">
                        <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Comments</label>
                        <textarea
                          value={horse.comments || ''}
                          onChange={(e) => {
                            const updatedHorses = formData.horses.map((h, i) =>
                              i === index ? { ...h, comments: e.target.value } : h
                            );
                            setFormData(prev => ({ ...prev, horses: updatedHorses }));
                          }}
                          className="flex-1 mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                          placeholder="Add any additional information about your horse..."
                        />
                      </div>
                    </div>

                    {/* Right Column - All Horse Details Fields */}
                    <div className="space-y-4">
                      {/* Horse Name */}
                      <div>
                        <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          Horse Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={horse.name}
                          onChange={(e) => {
                            const updatedHorses = formData.horses.map((h, i) =>
                              i === index ? { ...h, name: e.target.value } : h
                            );
                            setFormData(prev => ({ ...prev, horses: updatedHorses }));
                          }}
                          required
                          placeholder="Enter horse name"
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Breed */}
                      <div>
                        <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          Breed <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={horse.breed}
                          onChange={(e) => {
                            const updatedHorses = formData.horses.map((h, i) =>
                              i === index ? { ...h, breed: e.target.value } : h
                            );
                            setFormData(prev => ({ ...prev, horses: updatedHorses }));
                          }}
                          required
                          placeholder="Enter breed"
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={horse.gender}
                          onChange={(e) => {
                            const updatedHorses = formData.horses.map((h, i) =>
                              i === index ? { ...h, gender: e.target.value } : h
                            );
                            setFormData(prev => ({ ...prev, horses: updatedHorses }));
                          }}
                          required
                          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Colt">Colt</option>
                          <option value="Filly">Filly</option>
                          <option value="Gelding">Gelding</option>
                          <option value="Mare">Mare</option>
                          <option value="Stallion">Stallion</option>
                        </select>
                      </div>

                      {/* Color and Size */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Colour <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={horse.colour}
                            onChange={(e) => {
                              const updatedHorses = formData.horses.map((h, i) =>
                                i === index ? { ...h, colour: e.target.value } : h
                              );
                              setFormData(prev => ({ ...prev, horses: updatedHorses }));
                            }}
                            required
                            placeholder="Enter colour"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Size (hh) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={horse.size}
                            onChange={(e) => {
                              const updatedHorses = formData.horses.map((h, i) =>
                                i === index ? { ...h, size: parseFloat(e.target.value) || 0 } : h
                              );
                              setFormData(prev => ({ ...prev, horses: updatedHorses }));
                            }}
                            required
                            step="0.1"
                            min="8"
                            max="20"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Birth Year */}
                      <div>
                        <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          Birth Year <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            value={horse.yearOfBirth}
                            onChange={(e) => {
                              const updatedHorses = formData.horses.map((h, i) =>
                                i === index ? { ...h, yearOfBirth: parseInt(e.target.value) || new Date().getFullYear() } : h
                              );
                              setFormData(prev => ({ ...prev, horses: updatedHorses }));
                            }}
                            required
                            min={1980}
                            max={new Date().getFullYear()}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <span className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Age: {horse.yearOfBirth ? new Date().getFullYear() - horse.yearOfBirth : '-'} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Add Horse Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {}} // TODO: Implement add horse functionality
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Add Horse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
