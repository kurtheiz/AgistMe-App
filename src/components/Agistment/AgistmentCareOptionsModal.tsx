import { useState, useEffect, useMemo } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from '../shared/Modal';
import { Agistment, AgistmentCare } from '../../types/agistment';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import { Loader2 } from 'lucide-react';

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

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditForm({
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
  }, [care]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditForm({
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
      setIsDirty(false);
    }
  }, [isOpen, care]);

  // Create content hash for form state tracking
  const contentHash = useMemo(() => {
    return JSON.stringify(editForm);
  }, [editForm]);

  const handleUpdateAll = async () => {
    if (!isDirty) return;
    
    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate({
          care: {
            selfCare: editForm.selfCare,
            partCare: editForm.partCare,
            fullCare: editForm.fullCare
          }
        });
      }
      onClose();
    } catch (error) {
      console.error('Error updating care options:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Care Options"
      size="lg"
      onDirtyChange={setIsDirty}
      isUpdating={isSaving}
      contentHash={contentHash}
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
      <div className="space-y-4 p-6 max-w-2xl mx-auto">
        {/* Self Care Section */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <Switch
              checked={editForm.selfCare.available}
              onChange={(checked) => {
                setEditForm(prev => ({ ...prev, selfCare: { ...prev.selfCare, available: checked } }));
                setIsDirty(true);
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
                      setIsDirty(true);
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
                      setIsDirty(true);
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
                setIsDirty(true);
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
                      setIsDirty(true);
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
                      setIsDirty(true);
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
                setIsDirty(true);
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
                      setIsDirty(true);
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
                      setIsDirty(true);
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
