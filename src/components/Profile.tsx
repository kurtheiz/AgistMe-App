import { useClerk, useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import { handlePhoneNumberChange, isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { Suburb } from '../types/generated/models/Suburb';
import { profileService } from '../services/profile.service';
import { Profile as ProfileType } from '../types/profile';
import { setAuthToken } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

export default function Profile() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data with user data to ensure inputs are controlled from the start
  const [formData, setFormData] = useState<ProfileType>({
    id: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    mobile: '',
    profilePhoto: user?.imageUrl || '',
    address: '',
    postcode: '',
    suburb: '',
    state: '',
    region: '',
    suburbId: '',
    geohash: '',
    horses: [],
    email: user?.primaryEmailAddress?.emailAddress || '',
    lastUpdate: new Date().toISOString(),
    dateOfBirth: ''
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      const formattedProfile = {
        ...profile,
        id: profile.id || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        mobile: profile.mobile || '',
        profilePhoto: profile.profilePhoto || user?.imageUrl || '',
        address: profile.address || '',
        postcode: profile.postcode || '',
        suburb: profile.suburb || '',
        state: profile.state || '',
        region: profile.region || '',
        suburbId: profile.suburbId || '',
        geohash: profile.geohash || '',
        horses: profile.horses || [],
        email: profile.email || user?.primaryEmailAddress?.emailAddress || '',
        // Convert ISO timestamp to YYYY-MM-DD format for the date input
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''
      };
      setFormData(formattedProfile);
    }
  }, [profile, user]);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken({ template: "AgistMe" });
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const { id, email, lastUpdate, ...updateData } = formData;
      
      console.log('Sending profile update:', updateData);
      const updatedProfile = await profileService.updateProfile(updateData, token);
      console.log('Received updated profile:', updatedProfile);
      updateProfileData(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
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

  if (!user) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-primary-200 group-hover:ring-primary-300 transition-all duration-300">
                  <img
                    src={formData.profilePhoto || user.imageUrl}
                    alt={user.fullName || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 cursor-pointer"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 sm:h-8 sm:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
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
                {user.primaryEmailAddress?.emailAddress}
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
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Suburb</label>
                  <input
                    type="text"
                    value={formData.suburb}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Post Code</label>
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Address</label>
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

            {/* Profile Actions */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - My Horses */}
        <div className="bg-white dark:bg-neutral-900 rounded-none sm:rounded-xl shadow-lg p-2 sm:p-8 md:block">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">My Horses</h2>
            <button
              onClick={() => {}} // TODO: Implement add horse functionality
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Add Horse
            </button>
          </div>

          {/* Horses List */}
          <div className="space-y-4">
            {formData.horses.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                No horses added yet. Click "Add Horse" to get started.
              </p>
            ) : (
              formData.horses.map((horse: any) => (
                <div key={horse.name} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-white">{horse.name}</h3>
                      <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <p>{horse.breed} • {new Date().getFullYear() - horse.yearOfBirth} years old</p>
                        <p>{horse.gender} • {horse.colour} • {horse.size}hh</p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
                      >
                        <span className="sr-only">Edit</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ml-3 inline-flex text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
                      >
                        <span className="sr-only">Delete</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {horse.comments && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {horse.comments}
                    </p>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Full Width Panel - My Favourites */}
        <div className="bg-white dark:bg-neutral-900 rounded-none sm:rounded-xl shadow-lg p-2 sm:p-8 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">My Favourites</h2>
          </div>
          <div className="space-y-4">
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
              No favourites added yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
