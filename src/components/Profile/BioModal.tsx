import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { isValidAusMobileNumber, isValidDateOfBirth, getMaxDateOfBirth, getMinDateOfBirth } from '../../utils/inputValidation';
import { SuburbSearch } from '../SuburbSearch';
import { ProfilePhoto } from './ProfilePhoto';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../types/profile';
import { Modal } from '../shared/Modal';
import toast from 'react-hot-toast';
import { Suburb } from '../../types/suburb';
import { useBioStore } from '../../stores/bio.store';

interface BioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  profile: Profile | null;
}

export default function BioModal({ isOpen = false, onClose = () => { }, profile }: BioModalProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [selectedSuburbs, setSelectedSuburbs] = useState<Suburb[]>([]);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    mobile?: string;
    dateOfBirth?: string;
    location?: string;
  }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        comments: profile.comments || '',
        profilePhoto: profile.profilePhoto || '',
        mobile: profile.mobile || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        suburb: profile.suburb || '',
        postcode: profile.postcode || '',
        geohash: profile.geohash || '',
        region: profile.region || '',
        state: profile.state || '',
        showProfileInEnquiry: profile.showProfileInEnquiry ?? false
      });
      setInitialHash(JSON.stringify(formData));
      setIsDirty(false);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    const currentHash = JSON.stringify(formData);
    setIsDirty(currentHash !== initialHash);
  }, [formData, initialHash]);

  const handleClose = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      comments: profile?.comments || '',
      profilePhoto: profile?.profilePhoto || '',
      mobile: profile?.mobile || '',
      dateOfBirth: profile?.dateOfBirth || '',
      address: profile?.address || '',
      suburb: profile?.suburb || '',
      postcode: profile?.postcode || '',
      geohash: profile?.geohash || '',
      region: profile?.region || '',
      state: profile?.state || '',
      showProfileInEnquiry: profile?.showProfileInEnquiry ?? false
    });
    onClose();
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.mobile && !isValidAusMobileNumber(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid Australian mobile number';
    }

    if (formData.dateOfBirth && !isValidDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date of birth';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!isDirty || saving || isUploading) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await useBioStore.getState().updateBio({
        ...formData,
        showProfileInEnquiry: formData.showProfileInEnquiry ?? false
      });
      setInitialHash(JSON.stringify(formData));
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSuburbSelect = (suburb: Suburb) => {
    const newSuburbs = [suburb];
    setSelectedSuburbs(newSuburbs);
    setFormData(prev => ({
      ...prev,
      suburb: suburb.suburb,
      state: suburb.state,
      postcode: suburb.postcode,
      region: suburb.region,
      geohash: suburb.geohash,
      showProfileInEnquiry: prev.showProfileInEnquiry ?? false // Ensure this is always boolean
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (!user) {
    return <div>No profile data available</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      size="lg"
      isUpdating={saving || isUploading}
      onAction={handleSubmit}
      disableAction={!isDirty || saving || isUploading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
        {/* <div className="section-container">
            <Switch.Group>
              <div className="flex items-center">
                <Switch
                  checked={formData.showProfileInEnquiry ?? false}
                  onChange={(checked) => setFormData(prev => ({ ...prev, showProfileInEnquiry: checked }))}
                  className={`${
                    formData.showProfileInEnquiry ?? false ? 'bg-primary-600' : 'bg-neutral-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      formData.showProfileInEnquiry ?? false ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">
                  Show my profile in enquiries
                </span>

              </div>
            </Switch.Group>
          </div> */}
          <div className="flex justify-center">
            <ProfilePhoto
              photoUrl={formData.profilePhoto || ''}
              isUploading={isUploading}
              onPhotoUpload={async (file: File) => {
                try {
                  setIsUploading(true);
                  const url = await profileService.uploadProfilePhoto(file);
                  setFormData(prev => ({ ...prev, profilePhoto: url }));
                  setIsDirty(true);
                } catch (error) {
                  console.error('Error uploading photo:', error);
                  toast.error('Failed to upload photo');
                } finally {
                  setIsUploading(false);
                }
              }}
              onPhotoRemove={() => {
                setFormData(prev => ({ ...prev, profilePhoto: '' }));
                setIsDirty(true);
              }}
              disabled={saving}
            />
          </div>

          <div className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`form-input form-input-compact ${errors.firstName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`form-input form-input-compact ${errors.lastName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="section-container">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  value={formData.mobile || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, mobile: value }));
                  }}
                  className={`form-input form-input-compact ${errors.mobile ? 'border-red-500' : ''}`}
                  placeholder="Enter 10 digit number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  min={getMinDateOfBirth()}
                  max={getMaxDateOfBirth()}
                  className={`form-input form-input-compact ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          <div className="section-container">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="form-input form-input-compact"
                placeholder="Enter your street address"
              />
            </div>
          </div>

          <div className="section-container">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Location
              </label>
              <SuburbSearch
                selectedSuburbs={selectedSuburbs}
                onSuburbsChange={(suburbs) => handleSuburbSelect(suburbs[0])}
                multiple={false}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Selected Suburb
                  </label>
                  <input
                    type="text"
                    value={formData.suburb || ''}
                    readOnly
                    disabled
                    className="form-input form-input-compact bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region || ''}
                    readOnly
                    disabled
                    className="form-input form-input-compact bg-neutral-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    readOnly
                    disabled
                    className="form-input form-input-compact bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Post Code
                  </label>
                  <input
                    type="text"
                    value={formData.postcode || ''}
                    readOnly
                    disabled
                    className="form-input form-input-compact bg-neutral-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-container">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Bio
              </label>
              <textarea
                id="comments"
                value={formData.comments || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                rows={4}
                className="form-input resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>

          
        </div>
      </form>
    </Modal>
  );
}
