import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { AgistmentResponse, FacilityBase, Stables, FloatParking } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import toast from 'react-hot-toast';

const calculateHash = (obj: unknown): string => {
  return JSON.stringify(obj);
};

const DEFAULT_FACILITIES: AgistmentResponse['facilities'] = {
  feedRoom: { available: false, comments: '' },
  floatParking: { available: false, comments: '', monthlyPrice: 0 },
  hotWash: { available: false, comments: '' },
  stables: { available: false, quantity: 0, comments: '' },
  tackRoom: { available: false, comments: '' },
  tieUp: { available: false, comments: '' }
};

interface AgistmentFacilitiesModalProps {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
}

export const AgistmentFacilitiesModal: React.FC<AgistmentFacilitiesModalProps> = ({
  agistment,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [editableFacilities, setEditableFacilities] = useState<AgistmentResponse['facilities']>(
    agistment.facilities || DEFAULT_FACILITIES
  );
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const initialFacilities = agistment.facilities || DEFAULT_FACILITIES;
      setEditableFacilities(initialFacilities);
      setInitialHash(calculateHash(initialFacilities));
      setIsDirty(false);
    }
  }, [isOpen, agistment]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editableFacilities);
    setIsDirty(currentHash !== initialHash);
  }, [editableFacilities, initialHash]);

  const handleClose = () => {
    const initialFacilities = agistment.facilities || DEFAULT_FACILITIES;
    setEditableFacilities(initialFacilities);
    setInitialHash(calculateHash(initialFacilities));
    setIsDirty(false);
    onClose();
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      const updatedAgistment: AgistmentResponse = {
        ...agistment,
        facilities: editableFacilities
      };
      await onUpdate(updatedAgistment);
      onClose();
    } catch (error) {
      console.error('Error saving facilities:', error);
      toast.error('Failed to save facilities');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFacility = (facility: keyof AgistmentResponse['facilities'], updates: Partial<FacilityBase>) => {
    setEditableFacilities(prev => ({
      ...prev,
      [facility]: {
        ...prev[facility],
        ...updates
      }
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Facilities"
      size="md"
      onAction={handleSave}
      isUpdating={isSaving}
      disableAction={!isDirty}
    >
      {Object.entries(editableFacilities)
        .sort(([keyA], [keyB]) => {
          const displayNames: Record<keyof AgistmentResponse['facilities'], string> = {
            feedRoom: 'Feed Room',
            floatParking: 'Float Parking',
            hotWash: 'Hot Wash',
            stables: 'Stables',
            tackRoom: 'Tack Room',
            tieUp: 'Tie Ups'
          };
          return displayNames[keyA as keyof AgistmentResponse['facilities']].localeCompare(displayNames[keyB as keyof AgistmentResponse['facilities']]);
        })
        .map(([key, facility]) => {
          const displayNames: Record<keyof AgistmentResponse['facilities'], string> = {
            feedRoom: 'Feed Room',
            floatParking: 'Float Parking',
            hotWash: 'Hot Wash',
            stables: 'Stables',
            tackRoom: 'Tack Room',
            tieUp: 'Tie Ups'
          };
          const displayName = displayNames[key as keyof AgistmentResponse['facilities']];
          return (
            <div key={key} className="border border-neutral-200 rounded-lg p-4 mb-4 relative">
              <div className="absolute -top-3 left-3 px-2 bg-white">
                <span className="text-sm font-medium text-neutral-900">{displayName}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={facility.available}
                    onChange={() => updateFacility(key as keyof AgistmentResponse['facilities'], { available: !facility.available })}
                    className={classNames(
                      facility.available ? 'bg-primary-600' : 'bg-neutral-200',
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                    )}
                  >
                    <span className="sr-only">{displayName} Available</span>
                    <span
                      className={classNames(
                        facility.available ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                      )}
                    />
                  </Switch>
                  <span className="text-sm text-neutral-600">Available</span>
                </div>

                <div className="mt-4">
                  {key === 'stables' && (
                    <NumberStepper
                      value={(facility as Stables).quantity}
                      onChange={(value) => updateFacility('stables', { available: true, comments: facility.comments, quantity: value } as Stables)}
                      min={0}
                      label="Number of Stables"
                      disabled={!facility.available}
                    />
                  )}
                  {key === 'floatParking' && (
                    <NumberStepper
                      value={(facility as FloatParking).monthlyPrice}
                      onChange={(value) => updateFacility('floatParking', { available: true, comments: facility.comments, monthlyPrice: value } as FloatParking)}
                      min={0}
                      label="Monthly Price ($)"
                      disabled={!facility.available}
                    />
                  )}
                  <input
                    type="text"
                    value={facility.comments}
                    onChange={(e) => updateFacility(key as keyof AgistmentResponse['facilities'], { comments: e.target.value })}
                    className="form-input form-input-compact mt-2"
                    placeholder="Add comments..."
                  />
                </div>
              </div>
            </div>
          );
        })}
    </Modal>
  );
};
