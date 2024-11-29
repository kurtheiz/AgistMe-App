import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { EditIcon } from '../Icons';
import { Location } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';

interface Props {
  agistmentId?: string;
  location: Location;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

export const AgistmentLocation = ({ agistmentId, location, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    address: location.address,
    suburb: location.suburb,
    state: location.state,
    postcode: location.postcode,
    region: location.region
  });

  const handleUpdateLocation = async () => {
    if (!agistmentId) return;
    
    try {
      const updatedAgistment = await agistmentService.updatePropertyLocation(agistmentId, {
        location: editForm
      });
      onUpdate?.(updatedAgistment);
      setIsEditDialogOpen(false);
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="group relative">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Location</h3>
            {isEditable && (
              <button
                onClick={() => {
                  setEditForm({
                    address: location.address,
                    suburb: location.suburb,
                    state: location.state,
                    postcode: location.postcode,
                    region: location.region
                  });
                  setIsEditDialogOpen(true);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
          <p className="text-neutral-700 dark:text-neutral-400">
            {location.address}
          </p>
          <p className="text-neutral-700 dark:text-neutral-400">
            {location.suburb}, {location.state} {location.postcode}
          </p>
        </div>
      </div>

      {isEditable && (
        <Dialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                Edit Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Suburb
                  </label>
                  <input
                    type="text"
                    value={editForm.suburb}
                    onChange={(e) => setEditForm(prev => ({ ...prev, suburb: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={editForm.postcode}
                    onChange={(e) => setEditForm(prev => ({ ...prev, postcode: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLocation}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
