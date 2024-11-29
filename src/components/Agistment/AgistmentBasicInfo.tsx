import { useState } from 'react';
import { EditIcon } from '../Icons';
import { Agistment } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';

interface Props {
  agistmentId: string;
  basicInfo: Agistment['basicInfo'];
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentBasicInfo = ({ agistmentId, basicInfo, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: basicInfo.name,
    propertySize: basicInfo.propertySize
  });
  const [nameError, setNameError] = useState('');
  const [propertySizeError, setPropertySizeError] = useState('');

  const handleUpdateBasicInfo = async () => {
    if (!agistmentId) return;
    
    if (editForm.name.trim().length < 3) {
      setNameError('Name must be at least 3 characters long');
      return;
    }

    if (editForm.propertySize < 0) {
      setPropertySizeError('Property size cannot be negative');
      return;
    }
    
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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {basicInfo.name}
            </h2>
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
          <p className="text-neutral-900 dark:text-neutral-400 mt-1">
            {basicInfo.propertySize > 0 ? `${basicInfo.propertySize} acres` : 'Property size not specified'}
          </p>
        </div>
      </div>

      {isEditable && (
        <Modal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          size="sm"
          title="Edit Basic Info"
          footerContent={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 
                  bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 
                  rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBasicInfo}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                  border border-transparent rounded-md hover:bg-primary-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Changes
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Property Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim().length >= 3) {
                      setNameError('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white pr-8"
                />
                {editForm.name && (
                  <button
                    onClick={() => setEditForm(prev => ({ ...prev, name: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>
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
                min="0"
                value={editForm.propertySize}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, propertySize: Number(e.target.value) }));
                  if (Number(e.target.value) >= 0) {
                    setPropertySizeError('');
                  }
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
              {propertySizeError && (
                <p className="mt-1 text-sm text-red-600">{propertySizeError}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
