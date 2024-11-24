import { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../utils/inputValidation';
import { SuburbSearch } from './SuburbSearch/SuburbSearch';
import { useProfile } from '../context/ProfileContext';
import { XMarkIcon } from './Icons';
import { ProfilePhoto } from './Profile/ProfilePhoto';
import { ProfileSkeleton } from './Profile/ProfileSkeleton';
import { profileService } from '../services/profile.service';
import { Profile, UpdateProfileRequest } from '../types/profile';

interface BioModalProps {
  isOpen: boolean;
  onClose: () => void;
  clearFields?: boolean;
}

const Bio = ({ isOpen = false, onClose = () => {}, clearFields = false }: BioModalProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { profile, loading, error, refreshProfile, updateProfileData } = useProfile();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [originalData, setOriginalData] = useState<Partial<Profile>>({});
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (clearFields) {
      setFormData({
        id: profile?.id,
        email: profile?.email,
        shareId: profile?.shareId,
        showProfileInEnquiry: false,
        lastUpdate: new Date().toISOString()
      });
    } else {
      setFormData({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        comments: profile?.comments !== null ? profile?.comments : '',
        profilePhoto: profile?.profilePhoto || '',
        mobile: profile?.mobile || '',
        dateOfBirth: profile?.dateOfBirth || '',
        address: profile?.address || '',
        suburb: profile?.suburb || '',
        postcode: profile?.postcode || '',
        geohash: profile?.geohash || '',
        suburbId: profile?.suburbId || '',
        region: profile?.region || '',
        state: profile?.state || '',
        showProfileInEnquiry: profile?.showProfileInEnquiry || false
      });
    }
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
      refreshProfile(true);
    }
  }, [isLoaded, isSignedIn, profile, loading, error, refreshProfile]);

  useEffect(() => {
    if (profile) {
      setOriginalData(formData);
    }
  }, [profile]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  if (loading) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div>No profile data available</div>;
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

  const handleSave = async () => {
    if (clearFields) {
      try {
        await updateProfileData({
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
          region: '',
          showProfileInEnquiry: false
        } as UpdateProfileRequest);
        onClose();
      } catch (error) {
        console.error('Error clearing profile:', error);
      }
    } else {
      handleSubmit(null);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              {/* Modal Content */}
              <div className="flex flex-col max-h-[calc(100vh-8rem)]">
                {/* Header - Fixed */}
                <div className="bg-primary-600 dark:bg-secondary-600 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                        {clearFields ? 'Delete My Bio' : 'Edit My Bio'}
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>

                {/* Body - Scrollable */}
                <div className="bg-white dark:bg-neutral-900 px-4 sm:px-6 overflow-y-auto">
                  <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
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
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Last Name
                        </label>
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                          disabled={clearFields}
                          className={`form-input h-10 text-sm w-full ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                        />
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
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              address: '',
                              suburb: '',
                              state: '',
                              postcode: '',
                              geohash: '',
                              suburbId: ''
                            }));
                          }}
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
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={clearFields}
                            className={`w-full rounded-md border px-3 py-2 text-sm ${
                              clearFields
                                ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed border-neutral-300 dark:border-neutral-600'
                                : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500'
                            }`}
                          />
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
                          placeholder={`Tell us more about ${formData.firstName || 'yourself'}`}
                          rows={3}
                          disabled={clearFields}
                          className={`form-textarea text-sm w-full resize-none ${clearFields ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                        Privacy Settings
                      </h4>
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
                          <span className={`ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 ${clearFields ? 'opacity-50 cursor-not-allowed' : ''}`}>Share my bio with enquiries</span>
                        </label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-[3.5rem]">
                          When enabled, your bio and horse information will be shared with agistors when you make an enquiry
                        </p>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer - Fixed */}
                <div className="bg-white dark:bg-neutral-900 px-4 py-3 sm:px-6 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      className="modal-button-secondary"
                    >
                      Cancel
                    </button>
                    {clearFields ? (
                      <button
                        onClick={handleSave}
                        className="modal-button-primary"
                      >
                        Confirm Delete
                      </button>
                    ) : (
                      <button
                        type="submit"
                        form="profile-form"
                        disabled={!hasChanges || saving}
                        className="modal-button-primary"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Bio;
