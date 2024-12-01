import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Agistment, PaddockBase } from '../../types/agistment';
import NumberStepper from '../shared/NumberStepper';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';
import { Switch } from '@headlessui/react';
import { Loader2 } from 'lucide-react';

interface PaddockForm extends Omit<PaddockBase, 'whenAvailable'> {
  whenAvailable: Date | undefined;
  enabled: boolean;
}

interface EditForm {
  privatePaddocks: PaddockForm;
  sharedPaddocks: PaddockForm;
  groupPaddocks: PaddockForm;
}

interface Props {
  agistmentId: string;
  paddocks: Agistment['paddocks'];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentPaddocksModal = ({
  agistmentId,
  paddocks,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    privatePaddocks: {
      ...paddocks.privatePaddocks,
      whenAvailable: paddocks.privatePaddocks.whenAvailable ? new Date(paddocks.privatePaddocks.whenAvailable) : undefined,
      enabled: paddocks.privatePaddocks.available > 0
    },
    sharedPaddocks: {
      ...paddocks.sharedPaddocks,
      whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
      enabled: paddocks.sharedPaddocks.available > 0
    },
    groupPaddocks: {
      ...paddocks.groupPaddocks,
      whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
      enabled: paddocks.groupPaddocks.available > 0
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditForm({
        privatePaddocks: {
          ...paddocks.privatePaddocks,
          whenAvailable: paddocks.privatePaddocks.whenAvailable ? new Date(paddocks.privatePaddocks.whenAvailable) : undefined,
          enabled: paddocks.privatePaddocks.available > 0
        },
        sharedPaddocks: {
          ...paddocks.sharedPaddocks,
          whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
          enabled: paddocks.sharedPaddocks.available > 0
        },
        groupPaddocks: {
          ...paddocks.groupPaddocks,
          whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
          enabled: paddocks.groupPaddocks.available > 0
        }
      });
      setIsDirty(false);
      setSelectedTab(0);
    }
  }, [isOpen, paddocks]);

  const handleUpdatePaddocks = async () => {
    if (!isDirty) return;
    setIsUpdating(true);
    
    try {
      const paddocksData = {
        paddocks: {
          privatePaddocks: {
            total: editForm.privatePaddocks.total,
            available: editForm.privatePaddocks.available,
            weeklyPrice: editForm.privatePaddocks.weeklyPrice,
            comments: editForm.privatePaddocks.comments,
            whenAvailable: editForm.privatePaddocks.whenAvailable
          },
          sharedPaddocks: {
            total: editForm.sharedPaddocks.total,
            available: editForm.sharedPaddocks.available,
            weeklyPrice: editForm.sharedPaddocks.weeklyPrice,
            comments: editForm.sharedPaddocks.comments,
            whenAvailable: editForm.sharedPaddocks.whenAvailable
          },
          groupPaddocks: {
            total: editForm.groupPaddocks.total,
            available: editForm.groupPaddocks.available,
            weeklyPrice: editForm.groupPaddocks.weeklyPrice,
            comments: editForm.groupPaddocks.comments,
            whenAvailable: editForm.groupPaddocks.whenAvailable
          }
        }
      };
      
      if (onUpdate) {
        await onUpdate(paddocksData);
      }
      onClose();
    } catch (error) {
      console.error('Error updating paddocks:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateMonthlyPrice = (weeklyPrice: number) => {
    return Math.round((weeklyPrice * 52) / 12);
  };

  const handleEditFormChange = (type: keyof EditForm, field: keyof PaddockForm, value: any) => {
    setIsDirty(true);
    setEditForm(prev => {
      const updatedForm = { ...prev };
      if (field === 'total') {
        const newTotal = Math.max(value, updatedForm[type].available);
        updatedForm[type] = {
          ...updatedForm[type],
          [field]: newTotal
        };
      } else if (field === 'available') {
        const newAvailable = Math.min(value, updatedForm[type].total);
        updatedForm[type] = {
          ...updatedForm[type],
          [field]: newAvailable
        };
      } else {
        updatedForm[type] = {
          ...updatedForm[type],
          [field]: value
        };
      }
      return updatedForm;
    });
  };

  const handleTogglePaddockType = (type: keyof EditForm) => {
    setEditForm(prev => {
      const newForm = { ...prev };
      newForm[type] = {
        ...newForm[type],
        enabled: !newForm[type].enabled,
        total: !newForm[type].enabled ? 1 : 0,
        available: 0,
        weeklyPrice: 0,
        comments: '',
        whenAvailable: undefined
      };
      return newForm;
    });
    setIsDirty(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Spaces"
      size="lg"
      contentHash={JSON.stringify(editForm)}
      onDirtyChange={setIsDirty}
      isUpdating={isUpdating}
      footerContent={({ isUpdating }) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleUpdatePaddocks}
            className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
              !isDirty || isUpdating
                ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
            }`}
            disabled={!isDirty || isUpdating}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    >
      <div className="p-4 space-y-6">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="sticky top-0 z-10 flex space-x-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
            {[
              { type: 'privatePaddocks', title: 'Private Paddocks' },
              { type: 'sharedPaddocks', title: 'Shared Paddocks' },
              { type: 'groupPaddocks', title: 'Group Paddocks' }
            ].map(({ type, title }) => (
              <Tab
                key={type}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-neutral-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/[0.12] hover:text-neutral-900 dark:hover:text-white'
                  )
                }
              >
                {title}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            {[
              { type: 'privatePaddocks', title: 'Private Paddocks' },
              { type: 'sharedPaddocks', title: 'Shared Paddocks' },
              { type: 'groupPaddocks', title: 'Group Paddocks' }
            ].map(({ type, title }) => (
              <Tab.Panel key={type} className="focus:outline-none">
                <div className="flex items-center justify-between mb-4 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {editForm[type as keyof EditForm].enabled ? `I have ${title.toLowerCase()}` : `No ${title.toLowerCase()}`}
                  </span>
                  <Switch
                    checked={editForm[type as keyof EditForm].enabled}
                    onChange={() => handleTogglePaddockType(type as keyof EditForm)}
                    className={`${
                      editForm[type as keyof EditForm].enabled ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                    } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        editForm[type as keyof EditForm].enabled ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
                <div className="space-y-6">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                    <p>Total spaces is the total number of horse spaces you have in this paddock type.</p>
                    <p>Available spaces is how many individual horse spaces are currently vacant.</p>
                    <p>Weekly price is the cost per horse, per week.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Total Spaces
                      </label>
                      <NumberStepper
                        value={editForm[type as keyof EditForm].total}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'total', value)}
                        min={editForm[type as keyof EditForm].enabled ? 1 : 0}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Available Spaces
                      </label>
                      <NumberStepper
                        value={editForm[type as keyof EditForm].available}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'available', value)}
                        min={0}
                        max={editForm[type as keyof EditForm].total}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                      Weekly Price ($)
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <NumberStepper
                        value={editForm[type as keyof EditForm].weeklyPrice}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'weeklyPrice', value)}
                        min={0}
                        step={1}
                      />
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        ≈ ${calculateMonthlyPrice(editForm[type as keyof EditForm].weeklyPrice)}/month
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                      Available From
                    </label>
                    <div className="w-full max-w-xs">
                      <input
                        type="date"
                        className="form-input block w-full text-center"
                        value={editForm[type as keyof EditForm].whenAvailable 
                          ? new Date(editForm[type as keyof EditForm].whenAvailable as Date).toISOString().split('T')[0] 
                          : ''}
                        onChange={(e) => handleEditFormChange(
                          type as keyof EditForm,
                          'whenAvailable',
                          e.target.value ? new Date(e.target.value) : undefined
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                      Comments
                    </label>
                    <div className="relative">
                      <textarea
                        className="form-textarea block w-full min-h-[120px] resize-none pr-8"
                        value={editForm[type as keyof EditForm].comments}
                        onChange={(e) => handleEditFormChange(type as keyof EditForm, 'comments', e.target.value)}
                        placeholder="Add any additional information about these spaces..."
                      />
                      {editForm[type as keyof EditForm].comments && (
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                          onClick={() => handleEditFormChange(type as keyof EditForm, 'comments', '')}
                          aria-label="Clear comments"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Modal>
  );
};
