import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Agistment, FloatParking } from '../../types/agistment';
import {
  FeedRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TackRoomIcon,
  TieUpIcon,
} from '../../components/Icons';
import { Modal } from '../shared/Modal';
import { agistmentService } from '../../services/agistment.service';
import toast from 'react-hot-toast';

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

  const handleSave = async () => {
    try {
      await agistmentService.updateAgistment(agistmentId, { facilities: editableFacilities });
      onUpdate?.({ facilities: editableFacilities });
      setIsModalOpen(false);
      toast.success('Facilities updated successfully');
    } catch (error) {
      console.error('Failed to update facilities:', error);
      toast.error('Failed to update facilities');
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
  };

  const handleUpdateComment = (facilityKey: keyof Agistment['facilities'], comment: string) => {
    setEditableFacilities(prev => ({
      ...prev,
      [facilityKey]: {
        ...prev[facilityKey],
        comments: comment
      }
    }));
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
  };

  return (
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h3 className="agistment-section-title">Facilities</h3>
        {isEditable && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-edit"
          >
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>

      <div className="agistment-section-content grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {/* Feed Room */}
        <div className="border-title-card">
          <span className="border-title-card-title">Feed Room</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.feedRoom.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <FeedRoomIcon className="w-full h-full" />
            </div>
            {facilities.feedRoom.comments && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
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
            {facilities.floatParking.available && facilities.floatParking.monthlyPrice > 0 && (
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">
                ${facilities.floatParking.monthlyPrice}/month
              </span>
            )}
            {facilities.floatParking.comments && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
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
            {facilities.stables.comments && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                {facilities.tackRoom.comments}
              </p>
            )}
          </div>
        </div>

        {/* Tie Up */}
        <div className="border-title-card">
          <span className="border-title-card-title">Tie Ups</span>
          <div className="border-title-card-content">
            <div className={`facility-icon ${facilities.tieUp.available ? 'facility-icon-available' : 'facility-icon-unavailable'}`}>
              <TieUpIcon className="w-full h-full" />
            </div>
            {facilities.tieUp.comments && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
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
        size="lg"
        title="Edit Facilities"
        footerContent={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="form-group">
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
            const icons: Record<keyof Agistment['facilities'], React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
              feedRoom: FeedRoomIcon,
              floatParking: FloatParkingIcon,
              hotWash: HotWashIcon,
              stables: StableIcon,
              tackRoom: TackRoomIcon,
              tieUp: TieUpIcon
            };
            const Icon = icons[key as keyof Agistment['facilities']];

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
              <div key={key} className="flex items-start space-x-4">
                <button
                  onClick={() => handleToggleFacility(key as keyof Agistment['facilities'])}
                  className={`w-12 h-12 p-2 rounded-lg transition-colors ${
                    facility.available 
                      ? 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20' 
                      : 'text-neutral-300 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-full h-full" />
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white">
                    {displayName}
                  </label>
                  <div className="mt-1 space-y-2">
                    <input
                      type="text"
                      value={facility.comments || ''}
                      onChange={(e) => handleUpdateComment(key as keyof Agistment['facilities'], e.target.value)}
                      placeholder="Add comments..."
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                    />
                    {key === 'floatParking' && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Monthly Price
                          </label>
                          <div className="relative rounded-md">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-neutral-500 dark:text-neutral-400 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              value={(facility as FloatParking).monthlyPrice || ''}
                              onChange={(e) => handleUpdatePrice(e.target.value)}
                              placeholder="0"
                              min="0"
                              step="1"
                              disabled={!facility.available}
                              className={`w-full px-3 py-2 pl-7 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 
                                ${!facility.available ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400' : 'dark:bg-neutral-700 dark:text-white'}`}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-neutral-500 dark:text-neutral-400 sm:text-sm">/month</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
