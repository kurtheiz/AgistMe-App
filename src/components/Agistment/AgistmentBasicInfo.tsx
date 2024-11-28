import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { EditIcon } from '../Icons';
import { AgistmentBasicInfo as AgistmentBasicInfoType } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';

interface Props {
  agistmentId?: string;
  basicInfo: AgistmentBasicInfoType;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

export const AgistmentBasicInfo = ({ agistmentId, basicInfo, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: basicInfo.name,
    propertySize: basicInfo.propertySize
  });
  const [nameError, setNameError] = useState('');

  const handleUpdateBasicInfo = async () => {
    if (!agistmentId) return;
    
    try {
      const updatedAgistment = await agistmentService.updateBasicInfo(agistmentId, {
        name: editForm.name,
        propertySize: editForm.propertySize
      });
      onUpdate?.(updatedAgistment);
      setIsEditDialogOpen(false);
      toast.success('Basic info updated successfully');
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast.error('Failed to update basic info');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {basicInfo.name}
          </h2>
          <p className="text-neutral-900 dark:text-neutral-400 mt-1">
            {basicInfo.propertySize > 0 ? `${basicInfo.propertySize} acres` : 'Property size not specified'}
          </p>
        </div>
        {isEditable && (
          <button
            onClick={() => {
              setEditForm({
                name: basicInfo.name,
                propertySize: basicInfo.propertySize
              });
              setIsEditDialogOpen(true);
            }}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>

      {isEditable && (
        <Dialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                Edit Basic Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, name: e.target.value }));
                      if (e.target.value.trim()) {
                        setNameError('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Property Size (acres)
                  </label>
                  <input
                    type="number"
                    value={editForm.propertySize}
                    onChange={(e) => setEditForm(prev => ({ ...prev, propertySize: Number(e.target.value) }))}
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
                  onClick={handleUpdateBasicInfo}
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
