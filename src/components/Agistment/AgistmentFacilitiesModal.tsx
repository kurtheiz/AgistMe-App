import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { Agistment, FacilityBase, Stables, FloatParking } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';
import { classNames } from '../../utils/classNames';

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
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens or facilities change
  useEffect(() => {
    if (isOpen || facilities) {
      setEditableFacilities(facilities);
      setIsDirty(false);
    }
  }, [isOpen, facilities]);

  // Create content hash for form state tracking
  const contentHash = useMemo(() => {
    return JSON.stringify(editableFacilities);
  }, [editableFacilities]);

  const updateFacility = (facility: keyof Agistment['facilities'], updates: Partial<FacilityBase>) => {
    setEditableFacilities(prev => ({
      ...prev,
      [facility]: {
        ...prev[facility],
        ...updates
      }
    }));
    setIsDirty(true);
  };

  const handleUpdateAll = async () => {
    if (!isDirty) return;

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Facilities"
      size="md"
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
            className={classNames(
              'w-2/3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors',
              !isDirty || isUpdating
                ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
            )}
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
