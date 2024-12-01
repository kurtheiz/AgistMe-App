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
  totalPaddocks: number;
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
      enabled: paddocks.privatePaddocks.available > 0,
      totalPaddocks: paddocks.privatePaddocks.totalPaddocks || 1
    },
    sharedPaddocks: {
      ...paddocks.sharedPaddocks,
      whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
      enabled: paddocks.sharedPaddocks.available > 0,
      totalPaddocks: paddocks.sharedPaddocks.totalPaddocks || 1
    },
    groupPaddocks: {
      ...paddocks.groupPaddocks,
      whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
      enabled: paddocks.groupPaddocks.available > 0,
      totalPaddocks: paddocks.groupPaddocks.totalPaddocks || 1
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditForm({
        privatePaddocks: {
          ...paddocks.privatePaddocks,
          whenAvailable: paddocks.privatePaddocks.whenAvailable ? new Date(paddocks.privatePaddocks.whenAvailable) : undefined,
          enabled: paddocks.privatePaddocks.available > 0,
          totalPaddocks: paddocks.privatePaddocks.totalPaddocks || 1
        },
        sharedPaddocks: {
          ...paddocks.sharedPaddocks,
          whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
          enabled: paddocks.sharedPaddocks.available > 0,
          totalPaddocks: paddocks.sharedPaddocks.totalPaddocks || 1
        },
        groupPaddocks: {
          ...paddocks.groupPaddocks,
          whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
          enabled: paddocks.groupPaddocks.available > 0,
          totalPaddocks: paddocks.groupPaddocks.totalPaddocks || 1
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
            whenAvailable: editForm.privatePaddocks.whenAvailable,
            totalPaddocks: editForm.privatePaddocks.totalPaddocks
          },
          sharedPaddocks: {
            total: editForm.sharedPaddocks.total,
            available: editForm.sharedPaddocks.available,
            weeklyPrice: editForm.sharedPaddocks.weeklyPrice,
            comments: editForm.sharedPaddocks.comments,
            whenAvailable: editForm.sharedPaddocks.whenAvailable,
            totalPaddocks: editForm.sharedPaddocks.totalPaddocks
          },
          groupPaddocks: {
            total: editForm.groupPaddocks.total,
            available: editForm.groupPaddocks.available,
            weeklyPrice: editForm.groupPaddocks.weeklyPrice,
            comments: editForm.groupPaddocks.comments,
            whenAvailable: editForm.groupPaddocks.whenAvailable,
            totalPaddocks: editForm.groupPaddocks.totalPaddocks
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
              { type: 'privatePaddocks', title: 'Private' },
              { type: 'sharedPaddocks', title: 'Shared' },
              { type: 'groupPaddocks', title: 'Group' }
            ].map(({ type, title }) => (
              <Tab.Panel key={type} className="focus:outline-none">
                <div className="space-y-6">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-4">
                    <p>How many <span className="font-bold">{title}</span> paddocks do you have?</p>
                    <p>If you set it to <b>0</b>, then this will be displayed as<br/> "We do not offer <b>{title}</b> paddocks."</p>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                    <div className="flex flex-col items-center gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Number of Paddocks
                        </label>
                        <NumberStepper
                          value={editForm[type as keyof EditForm].totalPaddocks}
                          onChange={(value) => {
                            setEditForm(prev => ({
                              ...prev,
                              [type]: {
                                ...prev[type as keyof EditForm],
                                totalPaddocks: value,
                                total: value === 0 ? 0 : prev[type as keyof EditForm].total,
                                available: value === 0 ? 0 : prev[type as keyof EditForm].available
                              }
                            }));
                            setIsDirty(true);
                          }}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-4">
                    <p>How many horses can your <span className="font-bold">{editForm[type as keyof EditForm].totalPaddocks}</span> paddocks accommodate in total?</p>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                    <div className="flex justify-center">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Total Horse Spot Capacity
                        </label>
                        <NumberStepper
                          value={editForm[type as keyof EditForm].total}
                          onChange={(value) => {
                            setEditForm(prev => ({
                              ...prev,
                              [type]: {
                                ...prev[type as keyof EditForm],
                                total: value,
                                available: Math.min(value, prev[type as keyof EditForm].available)
                              }
                            }));
                            setIsDirty(true);
                          }}
                          min={1}
                          max={100}
                          disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                    <p>How many horse spots are currently vacant?</p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex flex-col items-center">
                      <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Available Horse Spots
                      </label>
                      <NumberStepper
                        value={editForm[type as keyof EditForm].available}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'available', value)}
                        min={0}
                        max={editForm[type as keyof EditForm].total}
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                    <p>What is the weekly cost per horse?</p>
                  </div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                      Weekly Price ($)
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <NumberStepper
                        value={editForm[type as keyof EditForm].weeklyPrice}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'weeklyPrice', value)}
                        min={0}
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                      />
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        ≈ ${calculateMonthlyPrice(editForm[type as keyof EditForm].weeklyPrice)}/month
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
                      <p>When is the soonest spot available?</p>
                    </div>
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
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
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
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
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
