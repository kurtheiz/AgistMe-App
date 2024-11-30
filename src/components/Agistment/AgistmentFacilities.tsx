import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Agistment, Stables } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import { agistmentService } from '../../services/agistment.service';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@headlessui/react';
import NumberStepper from '../shared/NumberStepper';
import {
  FeedRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TackRoomIcon,
  TieUpIcon,
} from '../Icons';

interface AgistmentFacilitiesProps {
  agistmentId: string;
  facilities: Agistment['facilities'];
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentFacilities: React.FC<AgistmentFacilitiesProps> = ({
  agistmentId,
  facilities,
  isEditable = false,
  onUpdate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableFacilities, setEditableFacilities] = useState(facilities);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setEditableFacilities({ ...facilities });
      setIsDirty(false);
    }
  }, [isModalOpen, facilities]);

  const handleSave = async () => {
    if (!agistmentId || !isDirty) return;

    setIsUpdating(true);
    try {
      await agistmentService.updateAgistment(agistmentId, { facilities: editableFacilities });
      setIsModalOpen(false);
      toast.success('Facilities updated successfully');
      
      if (onUpdate) {
        onUpdate({
          facilities: editableFacilities
        });
      }
    } catch (error) {
      console.error('Failed to update facilities:', error);
      toast.error('Failed to update facilities');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFacility = (facilityKey: keyof Agistment['facilities']) => {
    setEditableFacilities(prev => ({
      ...prev,
      [facilityKey]: {
        ...prev[facilityKey],
        available: !prev[facilityKey].available
      }
    }));
    setIsDirty(true);
  };

  const handleUpdateComment = (facilityKey: keyof Agistment['facilities'], comment: string) => {
    setEditableFacilities(prev => ({
      ...prev,
      [facilityKey]: {
        ...prev[facilityKey],
        comments: comment
      }
    }));
    setIsDirty(true);
  };

  const handleUpdatePrice = (price: string) => {
    const numericPrice = Math.round(parseFloat(price)) || 0;
    setEditableFacilities(prev => ({
      ...prev,
      floatParking: {
        ...prev.floatParking,
        monthlyPrice: numericPrice
      }
    }));
    setIsDirty(true);
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
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h3 className="agistment-section-title">Facilities</h3>
        {isEditable && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {/* Feed Room */}
        <div className="border-title-card">
          <span className="border-title-card-title">Feed Room</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.feedRoom.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <FeedRoomIcon className="w-full h-full" />
            </div>
            {facilities.feedRoom.comments && (
              <p className="comments">
                {facilities.feedRoom.comments}
              </p>
            )}
          </div>
        </div>

        {/* Float Parking */}
        <div className="border-title-card">
          <span className="border-title-card-title">Float Parking</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.floatParking.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <FloatParkingIcon className="w-full h-full" />
            </div>
            <span className={`text-sm font-medium mt-1 ${facilities.floatParking.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-500'}`}>
              {facilities.floatParking.monthlyPrice > 0 ? `$${facilities.floatParking.monthlyPrice}/month` : 'Free'}
            </span>
            {facilities.floatParking.comments && (
              <p className="comments">
                {facilities.floatParking.comments}
              </p>
            )}
          </div>
        </div>

        {/* Hot Wash */}
        <div className="border-title-card">
          <span className="border-title-card-title">Hot Wash Bay</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.hotWash.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <HotWashIcon className="w-full h-full" />
            </div>
            {facilities.hotWash.comments && (
              <p className="comments">
                {facilities.hotWash.comments}
              </p>
            )}
          </div>
        </div>

        {/* Stables */}
        <div className="border-title-card">
          <span className="border-title-card-title">Stables</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.stables.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <StableIcon className="w-full h-full" />
            </div>
            <span className={`text-sm font-medium mt-1 ${facilities.stables.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-500'}`}>
              {facilities.stables.quantity || 0} {facilities.stables.quantity === 1 ? 'stable' : 'stables'}
            </span>
            {facilities.stables.comments && (
              <p className="comments">
                {facilities.stables.comments}
              </p>
            )}
          </div>
        </div>

        {/* Tack Room */}
        <div className="border-title-card">
          <span className="border-title-card-title">Tack Room</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.tackRoom.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <TackRoomIcon className="w-full h-full" />
            </div>
            {facilities.tackRoom.comments && (
              <p className="comments">
                {facilities.tackRoom.comments}
              </p>
            )}
          </div>
        </div>

        {/* Tie Ups */}
        <div className="border-title-card">
          <span className="border-title-card-title">Tie Ups</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.tieUp.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <TieUpIcon className="w-full h-full" />
            </div>
            {facilities.tieUp.comments && (
              <p className="comments">
                {facilities.tieUp.comments}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
                      onChange={() => handleToggleFacility(key as keyof Agistment['facilities'])}
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

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        {displayName}
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={facility.comments || ''}
                          onChange={(e) => handleUpdateComment(key as keyof Agistment['facilities'], e.target.value)}
                          placeholder="Add comments..."
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="input-delete-button"
                          onClick={() => handleUpdateComment(key as keyof Agistment['facilities'], '')}
                          aria-label={`Clear ${displayName} comments`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  {key === 'floatParking' && (
                    <div className="mt-4">
                      <NumberStepper
                        label="Monthly Price"
                        value={editableFacilities.floatParking.monthlyPrice}
                        onChange={(value) => handleUpdatePrice(value.toString())}
                        min={0}
                        step={1}
                        formatValue={(value) => `$${value}`}
                      />
                    </div>
                  )}

                  {key === 'stables' && (
                    <div className="mt-4">
                      <NumberStepper
                        label="Number of Stables"
                        value={(editableFacilities.stables as Stables).quantity || 0}
                        onChange={(value) => {
                          setEditableFacilities(prev => ({
                            ...prev,
                            stables: {
                              ...prev.stables,
                              quantity: value
                            }
                          }));
                          setIsDirty(true);
                        }}
                        min={0}
                        step={1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </Modal>
    </div>
  );
};
