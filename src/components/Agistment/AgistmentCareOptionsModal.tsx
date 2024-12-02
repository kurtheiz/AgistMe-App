import { useState, useEffect, useMemo } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from '../shared/Modal';
import { Agistment, AgistmentCare } from '../../types/agistment';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const calculateHash = (obj: any): string => {
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

interface Props {
  care: AgistmentCare;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentCareOptionsModal = ({
  care,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [editForm, setEditForm] = useState<EditForm>({
    selfCare: {
      available: care?.selfCare?.available || false,
      monthlyPrice: care?.selfCare?.monthlyPrice || 0,
      comments: care?.selfCare?.comments || ''
    },
    partCare: {
      available: care?.partCare?.available || false,
      monthlyPrice: care?.partCare?.monthlyPrice || 0,
      comments: care?.partCare?.comments || ''
    },
    fullCare: {
      available: care?.fullCare?.available || false,
      monthlyPrice: care?.fullCare?.monthlyPrice || 0,
      comments: care?.fullCare?.comments || ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const initialFormState = {
        selfCare: {
          available: care?.selfCare?.available || false,
          monthlyPrice: care?.selfCare?.monthlyPrice || 0,
          comments: care?.selfCare?.comments || ''
        },
        partCare: {
          available: care?.partCare?.available || false,
          monthlyPrice: care?.partCare?.monthlyPrice || 0,
          comments: care?.partCare?.comments || ''
        },
        fullCare: {
          available: care?.fullCare?.available || false,
          monthlyPrice: care?.fullCare?.monthlyPrice || 0,
          comments: care?.fullCare?.comments || ''
        }
      };
      setEditForm(initialFormState);
      setInitialHash(calculateHash(initialFormState));
      setIsDirty(false);
    }
  }, [isOpen, care]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

  const handleClose = () => {
    const initialFormState = {
      selfCare: {
        available: care?.selfCare?.available || false,
        monthlyPrice: care?.selfCare?.monthlyPrice || 0,
        comments: care?.selfCare?.comments || ''
      },
      partCare: {
        available: care?.partCare?.available || false,
        monthlyPrice: care?.partCare?.monthlyPrice || 0,
        comments: care?.partCare?.comments || ''
      },
      fullCare: {
        available: care?.fullCare?.available || false,
        monthlyPrice: care?.fullCare?.monthlyPrice || 0,
        comments: care?.fullCare?.comments || ''
      }
    };
    setEditForm(initialFormState);
    setInitialHash(calculateHash(initialFormState));
    setIsDirty(false);
    onClose();
  };

  const handleUpdateAll = async () => {
    setIsSaving(true);
    try {
      const updatedAgistment: Partial<Agistment> = {
        care: {
          selfCare: editForm.selfCare,
          partCare: editForm.partCare,
          fullCare: editForm.fullCare
        }
      };

      if (onUpdate) {
        await onUpdate(updatedAgistment);
      }
      onClose();
    } catch (error) {
      console.error('Error updating care options:', error);
      toast.error('Failed to update care options');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = () => {
    handleUpdateAll();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Care Options"
      size="lg"
      isUpdating={isSaving}
      actionIcon={<Save className="h-5 w-5" />}
      onAction={handleAction}
      isDirty={isDirty}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Self Care Section */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
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
            <div className="flex-grow">
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Self Care
              </label>
              <div className="mt-2">
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
                    disabled={!editForm.selfCare.available}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part Care Section */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
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
            <div className="flex-grow">
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Part Care
              </label>
              <div className="mt-2">
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
                    disabled={!editForm.partCare.available}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Care Section */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
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
            <div className="flex-grow">
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Full Care
              </label>
              <div className="mt-2">
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
                    disabled={!editForm.fullCare.available}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
