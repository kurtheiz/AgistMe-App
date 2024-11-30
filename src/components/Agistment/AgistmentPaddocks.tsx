import { Pencil, Calendar, Loader2 } from 'lucide-react';
import { formatAvailabilityDate } from '../../utils/dates';
import { Agistment, PaddockBase } from '../../types/agistment';
import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';
import { Switch } from '@headlessui/react';

interface PaddockForm extends Omit<PaddockBase, 'whenAvailable'> {
  whenAvailable: Date | undefined;
  enabled: boolean;
}

interface EditForm {
  privatePaddocks: PaddockForm;
  sharedPaddocks: PaddockForm;
  groupPaddocks: PaddockForm;
}

interface AgistmentPaddocksProps {
  paddocks: Agistment['paddocks'];
  isEditable?: boolean;
  agistmentId?: string;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

const calculateMonthlyPrice = (weeklyPrice: number) => {
  return Math.round((weeklyPrice * 52) / 12);
};

export const AgistmentPaddocks: React.FC<AgistmentPaddocksProps> = ({
  paddocks = {
    privatePaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    sharedPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    groupPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined }
  },
  isEditable = false,
  agistmentId,
  onUpdate
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
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
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isEditDialogOpen) {
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
  }, [isEditDialogOpen, paddocks]);

  const handleUpdatePaddocks = async () => {
    if (!agistmentId || !isDirty) return;

    setIsUpdating(true);
    try {
      const response = await agistmentService.updatePaddocks(agistmentId, editForm);
      
      if (onUpdate) {
        onUpdate(response);
      }
      
      setIsEditDialogOpen(false);
      toast.success('Paddock information updated successfully');
    } catch (error) {
      console.error('Error updating paddocks:', error);
      toast.error('Failed to update paddock information');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditFormChange = (type: keyof EditForm, field: keyof PaddockForm, value: any) => {
    setIsDirty(true);
    setEditForm(prev => {
      const updatedForm = { ...prev };
      if (field === 'total') {
        // Ensure total is not less than available
        const newTotal = Math.max(value, updatedForm[type].available);
        updatedForm[type] = {
          ...updatedForm[type],
          [field]: newTotal
        };
      } else if (field === 'available') {
        // Ensure available is not more than total
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
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h2 className="agistment-section-title">Spaces Available</h2>
        {isEditable && (
          <button className="btn-edit" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="paddock-grid">
        {/* Private Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Private Paddocks</span>
          <div className="border-title-card-content">
            {!paddocks?.privatePaddocks?.total ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      !paddocks?.privatePaddocks?.available
                        ? 'paddock-availability-unavailable'
                        : paddocks?.privatePaddocks?.whenAvailable && new Date(paddocks.privatePaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks?.privatePaddocks?.available ?? 0} of ${paddocks?.privatePaddocks?.total ?? 0}`}
                    </span>
                    {paddocks?.privatePaddocks?.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.privatePaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks?.privatePaddocks?.weeklyPrice ?? 0}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks?.privatePaddocks?.weeklyPrice ?? 0)}
                      <span className="paddock-cost-period">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shared Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Shared Paddocks</span>
          <div className="border-title-card-content">
            {!paddocks?.sharedPaddocks?.total ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      !paddocks?.sharedPaddocks?.available
                        ? 'paddock-availability-unavailable'
                        : paddocks?.sharedPaddocks?.whenAvailable && new Date(paddocks.sharedPaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks?.sharedPaddocks?.available ?? 0} of ${paddocks?.sharedPaddocks?.total ?? 0}`}
                    </span>
                    {paddocks?.sharedPaddocks?.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.sharedPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks?.sharedPaddocks?.weeklyPrice ?? 0}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks?.sharedPaddocks?.weeklyPrice ?? 0)}
                      <span className="paddock-cost-period">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Group Paddocks</span>
          <div className="border-title-card-content">
            {!paddocks?.groupPaddocks?.total ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      !paddocks?.groupPaddocks?.available
                        ? 'paddock-availability-unavailable'
                        : paddocks?.groupPaddocks?.whenAvailable && new Date(paddocks.groupPaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks?.groupPaddocks?.available ?? 0} of ${paddocks?.groupPaddocks?.total ?? 0}`}
                    </span>
                    {paddocks?.groupPaddocks?.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.groupPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks?.groupPaddocks?.weeklyPrice ?? 0}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks?.groupPaddocks?.weeklyPrice ?? 0)}
                      <span className="paddock-cost-period">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
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
            <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
              <Tab
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
                Private Paddocks
              </Tab>
              <Tab
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
                Shared Paddocks
              </Tab>
              <Tab
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
                Group Paddocks
              </Tab>
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
    </div>
  );
};
