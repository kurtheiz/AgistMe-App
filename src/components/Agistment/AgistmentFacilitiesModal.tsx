import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Agistment, FacilityBase, Stables, FloatParking } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const calculateHash = (obj: any): string => {
  return JSON.stringify(obj);
};

interface AgistmentFacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Agistment['facilities'];
  agistmentId: string;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentFacilitiesModal: React.FC<AgistmentFacilitiesModalProps> = ({
  isOpen,
  onClose,
  facilities,
  onUpdate
}) => {
  const [editableFacilities, setEditableFacilities] = useState<Agistment['facilities']>(facilities);
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setEditableFacilities(facilities);
      setInitialHash(calculateHash(facilities));
      setIsDirty(false);
    }
  }, [isOpen, facilities]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editableFacilities);
    setIsDirty(currentHash !== initialHash);
  }, [editableFacilities, initialHash]);

  const handleClose = () => {
    setEditableFacilities(facilities);
    setInitialHash(calculateHash(facilities));
    setIsDirty(false);
    onClose();
  };

  const handleUpdateAll = async () => {
    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate({
          facilities: editableFacilities
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update facilities:', error);
      toast.error('Failed to update facilities');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = () => {
    handleUpdateAll();
  };

  const updateFacility = (facility: keyof Agistment['facilities'], updates: Partial<FacilityBase>) => {
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
      isUpdating={isSaving}
      actionIcon={<Save className="h-5 w-5" />}
      onAction={handleAction}
      isDirty={isDirty}
    >
      {Object.entries(editableFacilities)
        .sort(([keyA], [keyB]) => {
          const displayNames: Record<keyof Agistment['facilities'], string> = {
            feedRoom: 'Feed Room',
            floatParking: 'Float Parking',
            hotWash: 'Hot Wash',
            stables: 'Stables',
            tackRoom: 'Tack Room',
            tieUp: 'Tie Ups'
          };
          return displayNames[keyA as keyof Agistment['facilities']].localeCompare(displayNames[keyB as keyof Agistment['facilities']]);
        })
        .map(([key, facility]) => {
          const displayNames: Record<keyof Agistment['facilities'], string> = {
            feedRoom: 'Feed Room',
            floatParking: 'Float Parking',
            hotWash: 'Hot Wash',
            stables: 'Stables',
            tackRoom: 'Tack Room',
            tieUp: 'Tie Ups'
          };
          const displayName = displayNames[key as keyof Agistment['facilities']];
          return (
            <div key={key} className="space-y-4">
              <div className="flex items-start space-x-4">
                <Switch
                  checked={facility.available}
                  onChange={() => updateFacility(key as keyof Agistment['facilities'], { available: !facility.available })}
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
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {displayName}
                  </label>
                  <div className="mt-2">
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
                      onChange={(e) => updateFacility(key as keyof Agistment['facilities'], { comments: e.target.value })}
                      className="form-input form-input-compact"
                      placeholder="Add comments..."
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </Modal>
  );
};
