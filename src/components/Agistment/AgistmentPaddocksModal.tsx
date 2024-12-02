import { useState, useEffect } from 'react';
import { Agistment, PaddockBase } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';

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

const calculateHash = (obj: any): string => {
  return JSON.stringify(obj);
};

export const AgistmentPaddocksModal = ({
  paddocks,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [editForm, setEditForm] = useState<EditForm>({
    privatePaddocks: {
      ...paddocks.privatePaddocks,
      whenAvailable: paddocks.privatePaddocks.whenAvailable ? new Date(paddocks.privatePaddocks.whenAvailable) : undefined,
      enabled: paddocks.privatePaddocks.available > 0,
      totalPaddocks: paddocks.privatePaddocks.totalPaddocks || 0
    },
    sharedPaddocks: {
      ...paddocks.sharedPaddocks,
      whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
      enabled: paddocks.sharedPaddocks.available > 0,
      totalPaddocks: paddocks.sharedPaddocks.totalPaddocks || 0
    },
    groupPaddocks: {
      ...paddocks.groupPaddocks,
      whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
      enabled: paddocks.groupPaddocks.available > 0,
      totalPaddocks: paddocks.groupPaddocks.totalPaddocks || 0
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditForm({
        privatePaddocks: {
          ...paddocks.privatePaddocks,
          whenAvailable: paddocks.privatePaddocks.whenAvailable ? new Date(paddocks.privatePaddocks.whenAvailable) : undefined,
          enabled: paddocks.privatePaddocks.available > 0,
          totalPaddocks: paddocks.privatePaddocks.totalPaddocks || 0
        },
        sharedPaddocks: {
          ...paddocks.sharedPaddocks,
          whenAvailable: paddocks.sharedPaddocks.whenAvailable ? new Date(paddocks.sharedPaddocks.whenAvailable) : undefined,
          enabled: paddocks.sharedPaddocks.available > 0,
          totalPaddocks: paddocks.sharedPaddocks.totalPaddocks || 0
        },
        groupPaddocks: {
          ...paddocks.groupPaddocks,
          whenAvailable: paddocks.groupPaddocks.whenAvailable ? new Date(paddocks.groupPaddocks.whenAvailable) : undefined,
          enabled: paddocks.groupPaddocks.available > 0,
          totalPaddocks: paddocks.groupPaddocks.totalPaddocks || 0
        }
      });
      setInitialHash(calculateHash(editForm));
      setIsDirty(false);
      setSelectedTab(0);
    }
  }, [isOpen, paddocks]);

  useEffect(() => {
    const currentHash = calculateHash(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

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
      setIsDirty(true);
      return updatedForm;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Paddocks"
      size="lg"
      actionIconType="SAVE"
      onAction={handleUpdatePaddocks}
      isUpdating={isUpdating}
      disableAction={!isDirty}
    >
      <div className="space-y-6">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 p-1">
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
                      ? 'bg-white shadow text-neutral-900'
                      : 'text-neutral-700 hover:bg-white/[0.12] hover:text-neutral-900'
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
                  <div className="text-sm text-neutral-600 text-center mb-4">
                    <p>How many <span className="font-bold">{title}</span> paddocks do you have?</p>
                    <p>If you set it to <b>0</b>, then this will be displayed as<br/> "We do not offer <b>{title}</b> paddocks."</p>
                  </div>
                  <div className="text-sm text-neutral-600 text-center mb-2">
                    <div className="flex flex-col items-center gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
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
                          }}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 text-center mb-4">
                    <p>How many horses can your <span className="font-bold">{editForm[type as keyof EditForm].totalPaddocks}</span> paddocks accommodate in total?</p>
                  </div>
                  <div className="text-sm text-neutral-600 text-center mb-2">
                    <div className="flex justify-center">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
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
                          }}
                          min={0}
                          max={100}
                          disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 text-center mb-2">
                    <p>How many horse spots are currently vacant?</p>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex flex-col items-center">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
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
                  <div className="text-sm text-neutral-600 text-center mb-2">
                    <p>What is the weekly cost per horse?</p>
                  </div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Weekly Price ($)
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <NumberStepper
                        value={editForm[type as keyof EditForm].weeklyPrice}
                        onChange={(value) => handleEditFormChange(type as keyof EditForm, 'weeklyPrice', value)}
                        min={0}
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                      />
                      <div className="text-sm text-neutral-500">
                        ≈ ${calculateMonthlyPrice(editForm[type as keyof EditForm].weeklyPrice)}/month
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-sm text-neutral-600 text-center mb-2">
                      <p>When is the soonest spot available?</p>
                    </div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
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
                    <label className="block text-sm font-medium leading-6 text-gray-900">
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
                          className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
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
