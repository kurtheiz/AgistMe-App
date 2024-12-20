import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { AgistmentResponse } from '../../types/agistment';
import toast from 'react-hot-toast';
import { SuburbSearch } from '../SuburbSearch';
import { Suburb } from '../../types/suburb';
import NumberStepper from '../shared/NumberStepper';

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
  disableOutsideClick?: boolean;
}

type EditForm = {
  propertyName: string;
  propertySize: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  region: string;
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  description: string;
  facebookUrl: string;
  websiteUrl: string;
  instagramUrl: string;
}

export const AgistmentHeaderModal = ({
  agistment,
  isOpen,
  onClose,
  onUpdate,
  disableOutsideClick
}: Props) => {
  const [editForm, setEditForm] = useState<EditForm>({
    propertyName: '',
    propertySize: 0,
    address: '',
    suburb: '',
    state: '',
    postcode: '',
    region: '',
    contactName: '',
    contactEmail: '',
    contactNumber: '',
    description: '',
    facebookUrl: agistment?.socialMedia?.find(s => s.type === 'facebook')?.link || '',
    websiteUrl: agistment?.socialMedia?.find(s => s.type === 'website')?.link || '',
    instagramUrl: agistment?.socialMedia?.find(s => s.type === 'instagram')?.link || ''
  });
  const [selectedSuburbs, setSelectedSuburbs] = useState<Suburb[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    propertyName?: string;
    address?: string;
    location?: string;
    email?: string;
    mobile?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    instagramUrl?: string;
  }>({});
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen && agistment) {
      setEditForm({
        propertyName: agistment.basicInfo?.name || '',
        propertySize: agistment.basicInfo?.propertySize || 0,
        address: agistment.propertyLocation?.location?.address || '',
        suburb: agistment.propertyLocation?.location?.suburb || '',
        state: agistment.propertyLocation?.location?.state || '',
        postcode: agistment.propertyLocation?.location?.postcode || '',
        region: agistment.propertyLocation?.location?.region || '',
        contactName: agistment.contact?.contactDetails?.name || '',
        contactEmail: agistment.contact?.contactDetails?.email || '',
        contactNumber: agistment.contact?.contactDetails?.number || '',
        description: agistment.propertyDescription?.description || '',
        facebookUrl: agistment?.socialMedia?.find(s => s.type === 'facebook')?.link || '',
        websiteUrl: agistment?.socialMedia?.find(s => s.type === 'website')?.link || '',
        instagramUrl: agistment?.socialMedia?.find(s => s.type === 'instagram')?.link || ''
      });
    }
  }, [isOpen, agistment]);

  useEffect(() => {
    if (isOpen) {
      const initialFormState = {
        propertyName: agistment?.basicInfo?.name || '',
        propertySize: agistment?.basicInfo?.propertySize || 0,
        address: agistment?.propertyLocation?.location?.address || '',
        suburb: agistment?.propertyLocation?.location?.suburb || '',
        state: agistment?.propertyLocation?.location?.state || '',
        postcode: agistment?.propertyLocation?.location?.postcode || '',
        region: agistment?.propertyLocation?.location?.region || '',
        contactName: agistment?.contact?.contactDetails?.name || '',
        contactEmail: agistment?.contact?.contactDetails?.email || '',
        contactNumber: agistment?.contact?.contactDetails?.number || '',
        description: agistment?.propertyDescription?.description || '',
        facebookUrl: agistment?.socialMedia?.find(s => s.type === 'facebook')?.link || '',
        websiteUrl: agistment?.socialMedia?.find(s => s.type === 'website')?.link || '',
        instagramUrl: agistment?.socialMedia?.find(s => s.type === 'instagram')?.link || ''
      };
      setInitialHash(JSON.stringify(initialFormState));
      setSelectedSuburbs([]);
      setIsDirty(false);
      setErrors({});
    }
  }, [isOpen, agistment]);

  useEffect(() => {
    const currentHash = JSON.stringify(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

  const handleClose = () => {
    const initialFormState = {
      propertyName: agistment.basicInfo?.name || '',
      propertySize: agistment.basicInfo?.propertySize || 0,
      address: agistment.propertyLocation?.location?.address || '',
      suburb: agistment.propertyLocation?.location?.suburb || '',
      state: agistment.propertyLocation?.location?.state || '',
      postcode: agistment.propertyLocation?.location?.postcode || '',
      region: agistment.propertyLocation?.location?.region || '',
      contactName: agistment.contact?.contactDetails?.name || '',
      contactEmail: agistment.contact?.contactDetails?.email || '',
      contactNumber: agistment.contact?.contactDetails?.number || '',
      description: agistment.propertyDescription?.description || '',
      facebookUrl: agistment?.socialMedia?.find(s => s.type === 'facebook')?.link || '',
      websiteUrl: agistment?.socialMedia?.find(s => s.type === 'website')?.link || '',
      instagramUrl: agistment?.socialMedia?.find(s => s.type === 'instagram')?.link || ''
    };
    setEditForm(initialFormState);
    setInitialHash(JSON.stringify(initialFormState));
    setSelectedSuburbs([]);
    setIsDirty(false);
    setErrors({});
    onClose();
  };

  const validateFields = () => {
    const newErrors: {
      propertyName?: string;
      address?: string;
      location?: string;
      email?: string;
      mobile?: string;
      facebookUrl?: string;
      websiteUrl?: string;
      instagramUrl?: string;
    } = {};
    
    const trimmedName = editForm.propertyName?.trim();
    if (!trimmedName) {
      newErrors.propertyName = 'Agistment Name is required';
    } else if (trimmedName.length < 3) {
      newErrors.propertyName = 'Agistment Name must be at least 3 characters long';
    } else if (trimmedName === 'New Agistment') {
      newErrors.propertyName = 'Agistment Name cannot be "New Agistment"';
    }

    if (!editForm.suburb || !editForm.state || !editForm.postcode || !editForm.region) {
      newErrors.location = 'Please select a suburb';
    }

    if (editForm.contactEmail && editForm.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.contactEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (editForm.contactNumber && editForm.contactNumber.trim()) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(editForm.contactNumber)) {
        newErrors.mobile = 'Mobile number must be exactly 10 digits';
      }
    }

    // Validate Facebook URL
    if (editForm.facebookUrl && editForm.facebookUrl.trim()) {
      const urlRegex = /^https?:\/\//i;
      if (!urlRegex.test(editForm.facebookUrl)) {
        newErrors.facebookUrl = 'URL must start with http:// or https://';
      }
    }

    // Validate Instagram URL
    if (editForm.instagramUrl && editForm.instagramUrl.trim()) {
      const urlRegex = /^https?:\/\//i;
      if (!urlRegex.test(editForm.instagramUrl)) {
        newErrors.instagramUrl = 'URL must start with http:// or https://';
      }
    }

    // Validate Website URL
    if (editForm.websiteUrl && editForm.websiteUrl.trim()) {
      const urlRegex = /^https?:\/\//i;
      if (!urlRegex.test(editForm.websiteUrl)) {
        newErrors.websiteUrl = 'URL must start with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateFields();
  }, [editForm]);

  const handleUpdateAll = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedAgistment: AgistmentResponse = {
        ...agistment,
        basicInfo: {
          name: editForm.propertyName,
          propertySize: editForm.propertySize
        },
        propertyLocation: {
          location: {
            address: editForm.address,
            suburb: editForm.suburb,
            state: editForm.state,
            postcode: editForm.postcode,
            region: editForm.region
          }
        },
        contact: {
          contactDetails: {
            name: editForm.contactName,
            email: editForm.contactEmail,
            number: editForm.contactNumber
          }
        },
        propertyDescription: {
          description: editForm.description || ''
        },
        socialMedia: [
          ...(agistment.socialMedia || []).filter(s => s.type !== 'facebook' && s.type !== 'website' && s.type !== 'instagram'),
          ...(editForm.facebookUrl ? [{ type: 'facebook', link: editForm.facebookUrl }] : []),
          ...(editForm.websiteUrl ? [{ type: 'website', link: editForm.websiteUrl }] : []),
          ...(editForm.instagramUrl ? [{ type: 'instagram', link: editForm.instagramUrl }] : [])
        ]
      };

      if (onUpdate) {
        await onUpdate(updatedAgistment);
      }
      onClose();
    } catch (error) {
      console.error('Error preparing agistment update:', error);
      toast.error('Failed to update property details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuburbChange = (suburbs: Suburb[]) => {
    const suburb = suburbs[0];
    if (suburb) {
      setEditForm(prev => ({
        ...prev,
        suburb: suburb.suburb,
        state: suburb.state,
        postcode: suburb.postcode,
        region: suburb.region
      }));
      setSelectedSuburbs(suburbs);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Property Details"
      size="lg"
      onAction={handleUpdateAll}
      isUpdating={isSaving}
      disableAction={!isDirty}
      disableOutsideClick={disableOutsideClick}
    >
      <div className="space-y-6">
        {/* Property Name */}
        <div className="section-container">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Agistment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.propertyName}
              onChange={(e) => {
                const newValue = e.target.value;
                setEditForm(prev => ({ ...prev, propertyName: newValue }));
              }}
              className={`form-input form-input-compact ${errors.propertyName ? 'border-red-500' : ''}`}
              placeholder="Enter agistment name (min. 3 characters)"
              required
            />
            {errors.propertyName && (
              <p className="mt-1 text-sm text-red-500">{errors.propertyName}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="section-container">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Street Address
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, address: e.target.value }));
                  }}
                  className={`form-input form-input-compact ${errors.address ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Suburb <span className="text-red-500">*</span>
              </label>
              <SuburbSearch
                selectedSuburbs={selectedSuburbs}
                onSuburbsChange={handleSuburbChange}
                multiple={false}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Selected Suburb
                  </label>
                  <input
                    type="text"
                    value={editForm.suburb || ''}
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
                    value={editForm.region}
                    readOnly
                    disabled
                    className="form-input form-input-compact bg-neutral-50"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  State
                </label>
                <input
                  type="text"
                  value={editForm.state}
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
                  value={editForm.postcode}
                  readOnly
                  disabled
                  className="form-input form-input-compact bg-neutral-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="section-container">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, contactName: e.target.value }));
                  }}
                  className="form-input form-input-compact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setEditForm(prev => ({ ...prev, contactNumber: value }));
                  }}
                  className={`form-input form-input-compact ${errors.mobile ? 'border-red-500' : ''}`}
                  placeholder="Enter 10 digit number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, contactEmail: e.target.value }));
                }}
                className={`form-input form-input-compact ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Size */}
        <div className="section-container">
          <div>
            <NumberStepper
              label="Property Size (acres)"
              value={editForm.propertySize}
              onChange={(value) => setEditForm(prev => ({ ...prev, propertySize: value }))}
              min={0}
              step={1}
              formatValue={(value) => value.toString()}
            />
          </div>
        </div>

        {/* Description */}
        <div className="section-container">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => {
                setEditForm(prev => ({ ...prev, description: e.target.value }));
              }}
              rows={4}
              className="form-textarea"
              placeholder="Describe your property..."
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="section-container">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Facebook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editForm.facebookUrl}
                  onChange={(e) => {
                    let url = e.target.value;
                    if (url && !url.match(/^https?:\/\//i)) {
                      url = 'https://' + url;
                    }
                    setEditForm(prev => ({ ...prev, facebookUrl: url }));
                  }}
                  className={`form-input form-input-compact w-64 ${errors.facebookUrl ? 'border-red-500' : ''}`}
                  placeholder="https://facebook.com/..."
                />
                {editForm.facebookUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(editForm.facebookUrl, '_blank')}
                    className="button-toolbar"
                  >
                    Test
                  </button>
                )}
              </div>
              {errors.facebookUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.facebookUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Instagram URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editForm.instagramUrl}
                  onChange={(e) => {
                    let url = e.target.value;
                    if (url && !url.match(/^https?:\/\//i)) {
                      url = 'https://' + url;
                    }
                    setEditForm(prev => ({ ...prev, instagramUrl: url }));
                  }}
                  className={`form-input form-input-compact w-64 ${errors.instagramUrl ? 'border-red-500' : ''}`}
                  placeholder="https://instagram.com/..."
                />
                {editForm.instagramUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(editForm.instagramUrl, '_blank')}
                    className="button-toolbar"
                  >
                    Test
                  </button>
                )}
              </div>
              {errors.instagramUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.instagramUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Website URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editForm.websiteUrl}
                  onChange={(e) => {
                    let url = e.target.value;
                    if (url && !url.match(/^https?:\/\//i)) {
                      url = 'https://' + url;
                    }
                    setEditForm(prev => ({ ...prev, websiteUrl: url }));
                  }}
                  className={`form-input form-input-compact w-64 ${errors.websiteUrl ? 'border-red-500' : ''}`}
                  placeholder="https://..."
                />
                {editForm.websiteUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(editForm.websiteUrl, '_blank')}
                    className="button-toolbar"
                  >
                    Test
                  </button>
                )}
              </div>
              {errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
