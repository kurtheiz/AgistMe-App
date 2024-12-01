import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { Agistment, FacilityBase, Stables, FloatParking } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import NumberStepper from '../shared/NumberStepper';

interface AgistmentFacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Agistment['facilities'];
  onSave: (facilities: Agistment['facilities']) => Promise<void>;
}

export const AgistmentFacilitiesModal: React.FC<AgistmentFacilitiesModalProps> = ({
  isOpen,
  onClose,
  facilities,
  onSave
}) => {
  const [editableFacilities, setEditableFacilities] = useState<Agistment['facilities']>(facilities);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setEditableFacilities(facilities);
  }, [facilities]);

  useEffect(() => {
    if (isOpen) {
      setIsDirty(false);
    }
  }, [isOpen]);

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

  const handleSave = async () => {
    if (!isDirty) return;

    setIsUpdating(true);
    try {
      await onSave(editableFacilities);
      onClose();
    } catch (error) {
      console.error('Failed to update facilities:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const footerContent = (
    <div className="flex justify-center space-x-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || isUpdating}
        className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
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
  );

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Facilities"
      size="md"
      footerContent={footerContent}
      isUpdating={isUpdating}
    >
      <div className="p-6 space-y-4">
        {Object.entries(editableFacilities)
          .sort(([keyA], [keyB]) => {
            const displayNames: Record<keyof Agistment['facilities'], string> = {
              feedRoom: 'Feed Room',
              floatParking: 'Float Parking',
              hotWash: 'Hot Wash Bay',
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
              hotWash: 'Hot Wash Bay',
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
                    className={`${
                      facility.available ? 'bg-green-600' : 'bg-neutral-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2`}
                  >
                    <span className="sr-only">{displayName} Available</span>
                    <span
                      className={`${
                        facility.available ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {displayName}
                    </label>
                    {facility.available && (
                      <>
                        {key === 'stables' && (
                          <div className="mt-2">
                            <NumberStepper
                              value={(facility as Stables).quantity}
                              onChange={(value) => updateFacility('stables', { available: true, comments: facility.comments, quantity: value } as Stables)}
                              min={0}
                              label="Number of Stables"
                            />
                          </div>
                        )}
                        {key === 'floatParking' && (
                          <div className="mt-2">
                            <NumberStepper
                              value={(facility as FloatParking).monthlyPrice}
                              onChange={(value) => updateFacility('floatParking', { available: true, comments: facility.comments, monthlyPrice: value } as FloatParking)}
                              min={0}
                              label="Monthly Price ($)"
                            />
                          </div>
                        )}
                        <div className="mt-2">
                          <textarea
                            value={facility.comments}
                            onChange={(e) => updateFacility(key as keyof Agistment['facilities'], { comments: e.target.value })}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700"
                            placeholder="Add comments..."
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </Modal>
  );
};
