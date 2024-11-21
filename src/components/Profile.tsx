import { useState, useEffect } from 'react';
import { useClerk, useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { useProfile } from '../context/ProfileContext';
import { ProgressBar } from './ProgressBar';
import { ArrowRightOnRectangleIcon, CheckIcon } from './Icons';
import { useAuthToken } from '../hooks/useAuthToken';
import { useProfileForm } from '../hooks/useProfileForm';
import { ProfilePhoto } from './Profile/ProfilePhoto';
import { HorseFormModal } from './Profile/HorseFormModal';
import { PageToolbar } from './PageToolbar';

export default function Profile() {
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  const { token } = useAuthToken();

  const {
    formData,
    setFormData,
    isSaving,
    isUploading,
    isDirty,
    uploadingHorseIndex,
    setUploadingHorseIndex,
    handleInputChange,
    handleHorseChange,
    handleProfilePhotoUpload,
    saveProfile
  } = useProfileForm(user, profile);

  const handleHorsePhotoUpload = async (index: number, file: File) => {
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      setUploadingHorseIndex(index);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url } = await response.json();
      handleHorseChange(index, 'profilePhoto', url);
    } catch (error) {
      console.error('Error uploading horse photo:', error);
      // You might want to show an error toast here
    } finally {
      setUploadingHorseIndex(null);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    
    const loadProfile = async () => {
      try {
        await refreshProfile(false);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    
    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedProfile = await saveProfile();
      updateProfileData(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const [selectedHorseIndex, setSelectedHorseIndex] = useState<number | null>(null);
  const [isHorseModalOpen, setIsHorseModalOpen] = useState(false);
  const [newHorse, setNewHorse] = useState<any | null>(null);

  const openHorseModal = (index: number | null) => {
    setSelectedHorseIndex(index);
    setIsHorseModalOpen(true);
  };

  const closeHorseModal = () => {
    setIsHorseModalOpen(false);
    setSelectedHorseIndex(null);
    setNewHorse(null);
  };

  const handleAddHorse = () => {
    const emptyHorse = {
      name: '',
      breed: '',
      gender: '',
      colour: '',
      height: '',
      profilePhoto: '',
      microchip: '',
      brand: '',
      notes: '',
    };
    setNewHorse(emptyHorse);
    openHorseModal(null);
  };

  const handleSaveHorse = async (horse: any) => {
    if (selectedHorseIndex !== null) {
      // Edit existing horse
      setFormData(prev => ({
        ...prev,
        horses: prev.horses.map((h, i) => i === selectedHorseIndex ? horse : h)
      }));
    } else {
      // Add new horse
      setFormData(prev => ({
        ...prev,
        horses: [...prev.horses, horse]
      }));
    }
    
    try {
      const updatedProfile = await saveProfile();
      updateProfileData(updatedProfile);
    } catch (err) {
      console.error('Error saving horse:', err);
      // You might want to show an error toast here
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800">
      <PageToolbar
        actions={
          <div className="flex items-center justify-between w-full">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        }
      />

      <div className="w-full pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Profile Settings</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your personal information and horses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Contact Info Panel */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Contact Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image */}
                <ProfilePhoto
                  photoUrl={formData.profilePhoto}
                  isUploading={isUploading}
                  onPhotoUpload={handleProfilePhotoUpload}
                  onPhotoRemove={() => handleInputChange('profilePhoto', '')}
                  fallbackUrl={user?.imageUrl || '/default-profile.png'}
                />

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
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      placeholder="First Name"
                      className="form-input form-input-compact"
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
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      placeholder="Last Name"
                      className="form-input form-input-compact"
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
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={getMaxDateOfBirth()}
                      min={getMinDateOfBirth()}
                      className="form-input form-input-compact [color-scheme:light] dark:[color-scheme:dark]"
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
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="Mobile Number"
                      className="form-input form-input-compact"
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
                    selectedSuburbs={formData.suburb && typeof formData.suburb !== 'string' ? [formData.suburb] : []}
                    onSuburbsChange={(suburbs) => {
                      const suburb = suburbs[0];
                      if (suburb) {
                        setFormData(prev => ({
                          ...prev,
                          suburb,
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        readOnly
                        className="form-input form-input-compact bg-neutral-100 dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Region</label>
                      <input
                        type="text"
                        value={formData.region}
                        readOnly
                        className="form-input form-input-compact bg-neutral-100 dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Suburb</label>
                      <input
                        type="text"
                        value={typeof formData.suburb === 'string' ? formData.suburb : formData.suburb?.suburb || ''}
                        readOnly
                        className="mt-1 block w-full rounded-md border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Post Code</label>
                      <input
                        type="text"
                        value={formData.postcode}
                        readOnly
                        className="form-input form-input-compact bg-neutral-100 dark:bg-neutral-800"
                      />
                    </div>
                  </div>
                  {/* Address Field */}
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your street address"
                      className="form-input"
                    />
                  </div>
                  {/* Comments Field */}
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      About
                    </label>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      placeholder={`Tell us more about ${formData.firstName || 'yourself'}`}
                      rows={4}
                      className="form-textarea"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Right Panel - My Horses */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Horses</h2>
                <button
                  type="button"
                  onClick={handleAddHorse}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Horse
                </button>
              </div>

              <div className="overflow-y-auto max-h-[600px] space-y-4 pr-2">
                {formData.horses.map((horse, index) => (
                  <div
                    key={index}
                    onClick={() => openHorseModal(index)}
                    className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {horse.profilePhoto && (
                        <img
                          src={horse.profilePhoto}
                          alt={horse.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                          {horse.name || 'Unnamed Horse'}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {horse.breed} • {horse.gender} • {horse.colour}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Horse Form Modal */}
              <HorseFormModal
                isOpen={isHorseModalOpen}
                onClose={closeHorseModal}
                horse={newHorse || (selectedHorseIndex !== null ? formData.horses[selectedHorseIndex] : {
                  name: '',
                  breed: '',
                  gender: '',
                  colour: '',
                  height: '',
                  profilePhoto: '',
                  microchip: '',
                  brand: '',
                  notes: '',
                })}
                index={selectedHorseIndex}
                onSave={handleSaveHorse}
                onCancel={closeHorseModal}
                isUploading={uploadingHorseIndex === selectedHorseIndex}
                onPhotoUpload={handleHorsePhotoUpload}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
