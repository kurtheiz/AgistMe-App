import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Agistment, AgistmentContact, AgistmentPropertyLocation, AgistmentBasicInfo, AgistmentDescription } from '../../types/agistment';
import toast from 'react-hot-toast';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { Suburb } from '../../types/suburb';
import NumberStepper from '../shared/NumberStepper';

interface Props {
  basicInfo?: AgistmentBasicInfo;
  propertyLocation?: AgistmentPropertyLocation;
  contactDetails?: AgistmentContact;
  propertyDescription?: AgistmentDescription;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

interface EditForm {
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
  description?: string;
}

export const AgistmentHeaderModal = ({
  basicInfo,
  propertyLocation,
  contactDetails,
  propertyDescription,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [editForm, setEditForm] = useState<EditForm>({
    propertyName: basicInfo?.name || '',
    propertySize: basicInfo?.propertySize || 0,
    address: propertyLocation?.location?.address || '',
    suburb: propertyLocation?.location?.suburb || '',
    state: propertyLocation?.location?.state || '',
    postcode: propertyLocation?.location?.postcode || '',
    region: propertyLocation?.location?.region || '',
    contactName: contactDetails?.contactDetails?.name || '',
    contactEmail: contactDetails?.contactDetails?.email || '',
    contactNumber: contactDetails?.contactDetails?.number || '',
    description: propertyDescription?.description || ''
  });
  const [selectedSuburbs, setSelectedSuburbs] = useState<Suburb[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    propertyName?: string;
    address?: string;
    location?: string;
    email?: string;
    mobile?: string;
  }>({});

  const validateFields = () => {
    const newErrors: { propertyName?: string; address?: string; location?: string; email?: string; mobile?: string; } = {};
    
    // Property Name is required
    if (!editForm.propertyName?.trim()) {
      newErrors.propertyName = 'Property Name is required';
    }

    // Address is required
    if (!editForm.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    // Suburb selection is required
    if (!editForm.suburb || !editForm.state || !editForm.postcode || !editForm.region) {
      newErrors.location = 'Please select a suburb';
    }

    // Email validation - optional but must be valid if provided
    if (editForm.contactEmail && editForm.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.contactEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Mobile validation - optional but must be 10 digits if provided
    if (editForm.contactNumber && editForm.contactNumber.trim()) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(editForm.contactNumber)) {
        newErrors.mobile = 'Mobile number must be exactly 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateAll = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedAgistment: Partial<Agistment> = {
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
        }
      };

      if (onUpdate) {
        onUpdate(updatedAgistment);
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
      setIsDirty(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Property Details"
      size="lg"
      onDirtyChange={setIsDirty}
      isUpdating={isSaving}
      footerContent={({ isUpdating }) => (
        <div className="flex w-full gap-2">
          <button
            onClick={onClose}
            className="w-1/3 px-4 py-2.5 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateAll}
            disabled={!isDirty || isUpdating}
            className={`w-2/3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              !isDirty || isUpdating
                ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        {/* Property Name */}
        <div className="section-container">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.propertyName}
              onChange={(e) => {
                setEditForm(prev => ({ ...prev, propertyName: e.target.value }));
                setIsDirty(true);
              }}
              className={`form-input form-input-compact ${errors.propertyName ? 'border-red-500' : ''}`}
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
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, address: e.target.value }));
                    setIsDirty(true);
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
                    setIsDirty(true);
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
                    setIsDirty(true);
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
                  setIsDirty(true);
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
              onChange={(value) => {
                setEditForm(prev => ({ ...prev, propertySize: value }));
                setIsDirty(true);
              }}
              min={0}
              step={1}
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
                setIsDirty(true);
              }}
              rows={4}
              className="form-textarea"
              placeholder="Describe your property..."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
