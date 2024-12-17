import { useState, useEffect } from 'react';
import { AgistmentResponse } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';

const calculateHash = (obj: unknown): string => {
  return JSON.stringify(obj);
};

interface CareForm {
  available: boolean;
  monthlyPrice: number;
  comments: string;
}

interface EditForm {
  selfCare: CareForm;
  partCare: CareForm;
  fullCare: CareForm;
}

interface ValidationErrors {
  selfCare?: { [key: string]: string };
  partCare?: { [key: string]: string };
  fullCare?: { [key: string]: string };
  general?: string;
}

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
}

export const AgistmentCareOptionsModal = ({
  agistment,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [editForm, setEditForm] = useState<EditForm>({
    selfCare: {
      available: agistment.care?.selfCare?.available || false,
      monthlyPrice: agistment.care?.selfCare?.monthlyPrice || 0,
      comments: agistment.care?.selfCare?.comments || ''
    },
    partCare: {
      available: agistment.care?.partCare?.available || false,
      monthlyPrice: agistment.care?.partCare?.monthlyPrice || 0,
      comments: agistment.care?.partCare?.comments || ''
    },
    fullCare: {
      available: agistment.care?.fullCare?.available || false,
      monthlyPrice: agistment.care?.fullCare?.monthlyPrice || 0,
      comments: agistment.care?.fullCare?.comments || ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>( {});

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const initialFormState = {
        selfCare: {
          available: agistment.care?.selfCare?.available || false,
          monthlyPrice: agistment.care?.selfCare?.monthlyPrice || 0,
          comments: agistment.care?.selfCare?.comments || ''
        },
        partCare: {
          available: agistment.care?.partCare?.available || false,
          monthlyPrice: agistment.care?.partCare?.monthlyPrice || 0,
          comments: agistment.care?.partCare?.comments || ''
        },
        fullCare: {
          available: agistment.care?.fullCare?.available || false,
          monthlyPrice: agistment.care?.fullCare?.monthlyPrice || 0,
          comments: agistment.care?.fullCare?.comments || ''
        }
      };
      setEditForm(initialFormState);
      setInitialHash(calculateHash(initialFormState));
      setIsDirty(false);
    }
  }, [isOpen, agistment]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

  const handleClose = () => {
    const initialFormState = {
      selfCare: {
        available: agistment.care?.selfCare?.available || false,
        monthlyPrice: agistment.care?.selfCare?.monthlyPrice || 0,
        comments: agistment.care?.selfCare?.comments || ''
      },
      partCare: {
        available: agistment.care?.partCare?.available || false,
        monthlyPrice: agistment.care?.partCare?.monthlyPrice || 0,
        comments: agistment.care?.partCare?.comments || ''
      },
      fullCare: {
        available: agistment.care?.fullCare?.available || false,
        monthlyPrice: agistment.care?.fullCare?.monthlyPrice || 0,
        comments: agistment.care?.fullCare?.comments || ''
      }
    };
    setEditForm(initialFormState);
    setInitialHash(calculateHash(initialFormState));
    setIsDirty(false);
    onClose();
  };

  const validateFields = () => {
    const newErrors: ValidationErrors = {};

    // Check if at least one care option is available
    const hasAnyCareOption = Object.values(editForm).some(care => care.available);
    if (!hasAnyCareOption) {
      newErrors.general = 'At least one care option must be available';
    }

    // Validate each care option
    const validateCare = (type: keyof EditForm) => {
      const care = editForm[type];
      const typeErrors: { [key: string]: string } = {};

      if (care.available && care.monthlyPrice < 0) {
        typeErrors.monthlyPrice = 'Monthly price cannot be negative';
      }

      if (Object.keys(typeErrors).length > 0) {
        newErrors[type] = typeErrors;
      }
    };

    validateCare('selfCare');
    validateCare('partCare');
    validateCare('fullCare');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Run validation whenever the form changes
  useEffect(() => {
    validateFields();
  }, [editForm]);

  const handleSave = async () => {
    if (!onUpdate) return;

    if (!validateFields()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const updatedAgistment: AgistmentResponse = {
        ...agistment,
        care: {
          selfCare: editForm.selfCare,
          partCare: editForm.partCare,
          fullCare: editForm.fullCare
        }
      };
      await onUpdate(updatedAgistment);
      onClose();
    } catch (error) {
      console.error('Error saving care options:', error);
      toast.error('Failed to save care options');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Care Options"
      size="lg"
      actionIconType="SAVE"
      onAction={handleSave}
      isUpdating={isSaving}
      disableAction={!isDirty}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        {errors.general && (
          <div className="text-sm text-red-500 text-center mb-4">
            {errors.general}
          </div>
        )}
        {/* Self Care Section */}
        <div className="border border-neutral-200 rounded-lg p-4 mb-4 relative">
          <div className="absolute -top-3 left-3 px-2 bg-white">
            <span className="text-sm font-medium text-neutral-900">Self Care</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.selfCare.available}
                onChange={(checked) => {
                  setEditForm(prev => ({ ...prev, selfCare: { ...prev.selfCare, available: checked } }));
                }}
                className={classNames(
                  editForm.selfCare.available ? 'bg-primary-600' : 'bg-neutral-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span className="sr-only">Self Care Available</span>
                <span
                  className={classNames(
                    editForm.selfCare.available ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
              <span className="text-sm text-neutral-600">Available</span>
            </div>
            <div className="mt-4">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                  Monthly Price ($)
                </label>
                <NumberStepper
                  value={editForm.selfCare.monthlyPrice}
                  onChange={(value) => {
                    setEditForm(prev => ({ ...prev, selfCare: { ...prev.selfCare, monthlyPrice: value } }));
                  }}
                  min={0}
                  disabled={!editForm.selfCare.available}
                />
                {errors.selfCare?.monthlyPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.selfCare.monthlyPrice}</p>
                )}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={editForm.selfCare.comments}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, selfCare: { ...prev.selfCare, comments: e.target.value } }));
                  }}
                  className="form-input form-input-compact"
                  placeholder="Add comments..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Part Care Section */}
        <div className="border border-neutral-200 rounded-lg p-4 mb-4 relative">
          <div className="absolute -top-3 left-3 px-2 bg-white">
            <span className="text-sm font-medium text-neutral-900">Part Care</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.partCare.available}
                onChange={(checked) => {
                  setEditForm(prev => ({ ...prev, partCare: { ...prev.partCare, available: checked } }));
                }}
                className={classNames(
                  editForm.partCare.available ? 'bg-primary-600' : 'bg-neutral-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span className="sr-only">Part Care Available</span>
                <span
                  className={classNames(
                    editForm.partCare.available ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
              <span className="text-sm text-neutral-600">Available</span>
            </div>
            <div className="mt-4">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                  Monthly Price ($)
                </label>
                <NumberStepper
                  value={editForm.partCare.monthlyPrice}
                  onChange={(value) => {
                    setEditForm(prev => ({ ...prev, partCare: { ...prev.partCare, monthlyPrice: value } }));
                  }}
                  min={0}
                  disabled={!editForm.partCare.available}
                />
                {errors.partCare?.monthlyPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.partCare.monthlyPrice}</p>
                )}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={editForm.partCare.comments}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, partCare: { ...prev.partCare, comments: e.target.value } }));
                  }}
                  className="form-input form-input-compact"
                  placeholder="Add comments..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Care Section */}
        <div className="border border-neutral-200 rounded-lg p-4 mb-4 relative">
          <div className="absolute -top-3 left-3 px-2 bg-white">
            <span className="text-sm font-medium text-neutral-900">Full Care</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm.fullCare.available}
                onChange={(checked) => {
                  setEditForm(prev => ({ ...prev, fullCare: { ...prev.fullCare, available: checked } }));
                }}
                className={classNames(
                  editForm.fullCare.available ? 'bg-primary-600' : 'bg-neutral-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span className="sr-only">Full Care Available</span>
                <span
                  className={classNames(
                    editForm.fullCare.available ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
              <span className="text-sm text-neutral-600">Available</span>
            </div>
            <div className="mt-4">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                  Monthly Price ($)
                </label>
                <NumberStepper
                  value={editForm.fullCare.monthlyPrice}
                  onChange={(value) => {
                    setEditForm(prev => ({ ...prev, fullCare: { ...prev.fullCare, monthlyPrice: value } }));
                  }}
                  min={0}
                  disabled={!editForm.fullCare.available}
                />
                {errors.fullCare?.monthlyPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullCare.monthlyPrice}</p>
                )}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={editForm.fullCare.comments}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, fullCare: { ...prev.fullCare, comments: e.target.value } }));
                  }}
                  className="form-input form-input-compact"
                  placeholder="Add comments..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
