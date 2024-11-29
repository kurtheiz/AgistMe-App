import { useState } from 'react';
import { EditIcon } from '../../components/Icons';
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
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Facilities</h2>
        {isEditable && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {/* Feed Room */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.feedRoom.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <FeedRoomIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Feed Room</span>
          {facilities.feedRoom.comments && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
              {facilities.feedRoom.comments}
            </p>
          )}
        </div>

        {/* Float Parking */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.floatParking.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <FloatParkingIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Float Parking</span>
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

        {/* Hot Wash */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.hotWash.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <HotWashIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Hot Wash Bay</span>
          {facilities.hotWash.comments && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
              {facilities.hotWash.comments}
            </p>
          )}
        </div>

        {/* Stables */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.stables.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <StableIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Stables</span>
          {facilities.stables.comments && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
              {facilities.stables.comments}
            </p>
          )}
        </div>

        {/* Tack Room */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.tackRoom.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <TackRoomIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Tack Room</span>
          {facilities.tackRoom.comments && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
              {facilities.tackRoom.comments}
            </p>
          )}
        </div>

        {/* Tie Up */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
          <div className={`w-12 h-12 mb-2 ${facilities.tieUp.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
            <TieUpIcon className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Tie Ups</span>
          {facilities.tieUp.comments && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
              {facilities.tieUp.comments}
            </p>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        title="Edit Facilities"
        footerContent={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 
                bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 
                rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                border border-transparent rounded-md hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-6 p-6">
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
