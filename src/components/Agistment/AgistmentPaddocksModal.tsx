import { useState, useEffect } from 'react';
import { AgistmentResponse, PaddockBase } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import { Tab, TabPanels, TabGroup, TabPanel, TabList } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface EditForm {
  privatePaddocks: PaddockBase;
  sharedPaddocks: PaddockBase;
  groupPaddocks: PaddockBase;
}

interface ValidationErrors {
  privatePaddocks?: { [key: string]: string };
  sharedPaddocks?: { [key: string]: string };
  groupPaddocks?: { [key: string]: string };
}

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
}

export const AgistmentPaddocksModal = ({
  agistment,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [editForm, setEditForm] = useState<EditForm>({
    privatePaddocks: agistment.paddocks?.privatePaddocks || {
      available: 0,
      total: 0,
      comments: '',
      weeklyPrice: 0,
      totalPaddocks: 0
    },
    sharedPaddocks: agistment.paddocks?.sharedPaddocks || {
      available: 0,
      total: 0,
      comments: '',
      weeklyPrice: 0,
      totalPaddocks: 0
    },
    groupPaddocks: agistment.paddocks?.groupPaddocks || {
      available: 0,
      total: 0,
      comments: '',
      weeklyPrice: 0,
      totalPaddocks: 0
    }
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialFormState = {
        privatePaddocks: agistment.paddocks?.privatePaddocks || {
          available: 0,
          total: 0,
          comments: '',
          weeklyPrice: 0,
          totalPaddocks: 0
        },
        sharedPaddocks: agistment.paddocks?.sharedPaddocks || {
          available: 0,
          total: 0,
          comments: '',
          weeklyPrice: 0,
          totalPaddocks: 0
        },
        groupPaddocks: agistment.paddocks?.groupPaddocks || {
          available: 0,
          total: 0,
          comments: '',
          weeklyPrice: 0,
          totalPaddocks: 0
        }
      };
      setEditForm(initialFormState);
      setInitialHash(JSON.stringify(initialFormState));
      setIsDirty(false);
      setSelectedTab(0);
    }
  }, [isOpen, agistment]);

  useEffect(() => {
    const currentHash = JSON.stringify(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

  const validateFields = () => {
    const newErrors: ValidationErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if at least one paddock type has paddocks
    const hasPaddocks = Object.values(editForm).some(paddock => paddock.totalPaddocks > 0);
    if (!hasPaddocks) {
      newErrors.privatePaddocks = { 
        ...newErrors.privatePaddocks,
        general: 'At least one paddock type must have paddocks' 
      };
      newErrors.sharedPaddocks = { 
        ...newErrors.sharedPaddocks,
        general: 'At least one paddock type must have paddocks' 
      };
      newErrors.groupPaddocks = { 
        ...newErrors.groupPaddocks,
        general: 'At least one paddock type must have paddocks' 
      };
    }

    const validatePaddock = (type: keyof EditForm) => {
      const paddock = editForm[type];
      const typeErrors: { [key: string]: string } = {};

      if (paddock.totalPaddocks < 0) {
        typeErrors.totalPaddocks = 'Number of paddocks cannot be negative';
      }

      if (paddock.total < 0) {
        typeErrors.total = 'Total capacity cannot be negative';
      }

      if (paddock.available < 0) {
        typeErrors.available = 'Available spots cannot be negative';
      }

      if (paddock.available > paddock.total) {
        typeErrors.available = 'Available spots cannot exceed total capacity';
      }

      if (paddock.weeklyPrice < 0) {
        typeErrors.weeklyPrice = 'Weekly price cannot be negative';
      }

      if (Object.keys(typeErrors).length > 0) {
        newErrors[type] = typeErrors;
      }
    };

    validatePaddock('privatePaddocks');
    validatePaddock('sharedPaddocks');
    validatePaddock('groupPaddocks');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateFields();
  }, [editForm]);

  const handleClose = () => {
    const initialFormState = {
      privatePaddocks: agistment.paddocks?.privatePaddocks || {
        available: 0,
        total: 0,
        comments: '',
        weeklyPrice: 0,
        totalPaddocks: 0
      },
      sharedPaddocks: agistment.paddocks?.sharedPaddocks || {
        available: 0,
        total: 0,
        comments: '',
        weeklyPrice: 0,
        totalPaddocks: 0
      },
      groupPaddocks: agistment.paddocks?.groupPaddocks || {
        available: 0,
        total: 0,
        comments: '',
        weeklyPrice: 0,
        totalPaddocks: 0
      }
    };
    setEditForm(initialFormState);
    setInitialHash(JSON.stringify(initialFormState));
    setIsDirty(false);
    setSelectedTab(0);
    onClose();
  };

  const handleUpdatePaddocks = async () => {
    if (!isDirty) return;
    
    if (!validateFields()) {
      const currentTab = tabs[selectedTab].type as keyof EditForm;
      if (errors[currentTab]) {
        toast.error('Please fix the validation errors before saving');
        return;
      }
    }

    setIsUpdating(true);
    
    try {
      const updatedAgistment: AgistmentResponse = {
        ...agistment,
        paddocks: {
          privatePaddocks: editForm.privatePaddocks,
          sharedPaddocks: editForm.sharedPaddocks,
          groupPaddocks: editForm.groupPaddocks
        }
      };
      
      if (onUpdate) {
        await onUpdate(updatedAgistment);
        handleClose();
      }
    } catch (error) {
      console.error('Error updating paddocks:', error);
      toast.error('Failed to update paddocks');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateMonthlyPrice = (weeklyPrice: number) => {
    return Math.round((weeklyPrice * 52) / 12);
  };

  const handleEditFormChange = (type: keyof EditForm, field: keyof PaddockBase, value: any) => {
    setEditForm(prev =>({

      ...prev,
      [type]: {
        ...prev[type],
        [field]: field === 'whenAvailable' && value 
          ? value // Keep the ISO string format from the input
          : value,
        ...(field === 'totalPaddocks' && value === 0 ? {
          available: 0,
          total: 0,
          weeklyPrice: 0,
          comments: '',
          whenAvailable: null
        } : {})
      }
    }));
    setIsDirty(true);
  };

  const tabs = [
    { type: 'privatePaddocks', title: 'Private Paddocks' },
    { type: 'sharedPaddocks', title: 'Shared Paddocks' },
    { type: 'groupPaddocks', title: 'Group Paddocks' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit ${tabs[selectedTab].title}`}
      size="lg"
      onAction={handleUpdatePaddocks}
      isUpdating={isUpdating}
      disableAction={!isDirty}
    >
      <div className="space-y-6">
        <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
          <TabList className="flex space-x-1 rounded-xl bg-neutral-100 p-1">
            {tabs.map(({ type, title }) => (
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
          </TabList>
          <TabPanels className="mt-4">
            {tabs.map(({ type, title }) => (
              <TabPanel key={type} className="focus:outline-none">
                <div className="space-y-6">
                  {errors[type as keyof ValidationErrors]?.general && (
                    <div className="text-sm text-red-500 text-center">
                      {errors[type as keyof ValidationErrors]?.general}
                    </div>
                  )}
                  <div className="text-sm text-neutral-600 text-center mb-4">
                    <p>How many <span className="font-bold">{title}</span> paddocks do you have?</p>
                    <p>If you set it to <b>0</b>, the it will display as <span className="chip-unavailable">
                  Unavailable</span></p>
                  </div>
                  <div className="text-sm text-neutral-600 text-center mb-2">
                    <div className="flex flex-col items-center gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Number of Paddocks
                        </label>
                        <NumberStepper
                          value={editForm[type as keyof EditForm].totalPaddocks}
                          onChange={(value) => handleEditFormChange(type as keyof EditForm, 'totalPaddocks', value)}
                          min={0}
                          max={100}
                        />
                        {errors[type as keyof ValidationErrors]?.totalPaddocks && (
                          <p className="mt-1 text-sm text-red-500">{errors[type as keyof ValidationErrors]?.totalPaddocks}</p>
                        )}
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
                          onChange={(value) => handleEditFormChange(type as keyof EditForm, 'total', value)}
                          min={0}
                          max={100}
                          disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                        />
                        {errors[type as keyof ValidationErrors]?.total && (
                          <p className="mt-1 text-sm text-red-500">{errors[type as keyof ValidationErrors]?.total}</p>
                        )}
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
                      {errors[type as keyof ValidationErrors]?.available && (
                        <p className="mt-1 text-sm text-red-500">{errors[type as keyof ValidationErrors]?.available}</p>
                      )}
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
                      {errors[type as keyof ValidationErrors]?.weeklyPrice && (
                        <p className="mt-1 text-sm text-red-500">{errors[type as keyof ValidationErrors]?.weeklyPrice}</p>
                      )}
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
                        className={`form-input block w-full text-center appearance-none ${
                          errors[type as keyof ValidationErrors]?.whenAvailable ? 'border-red-500' : ''
                        }`}
                        style={{ WebkitAppearance: 'textfield' }}
                        value={editForm[type as keyof EditForm].whenAvailable || ''}
                        onChange={(e) => handleEditFormChange(
                          type as keyof EditForm,
                          'whenAvailable',
                          e.target.value
                        )}
                        disabled={editForm[type as keyof EditForm].totalPaddocks === 0}
                      />
                      {errors[type as keyof ValidationErrors]?.whenAvailable && (
                        <p className="mt-1 text-sm text-red-500">{errors[type as keyof ValidationErrors]?.whenAvailable}</p>
                      )}
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
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </Modal>
  );
};
