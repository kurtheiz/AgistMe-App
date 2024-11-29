import { useState } from 'react';
import { EditIcon } from '../Icons';
import { Agistment } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';

interface Props {
  agistmentId: string;
  description: string;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentDescription = ({ agistmentId, description, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleUpdateDescription = async () => {
    if (!agistmentId) return;
    
    try {
      await agistmentService.updatePropertyDescription(agistmentId, {
        description: editedDescription
      });
      
      setIsEditDialogOpen(false);
      toast.success('Property description updated successfully');
      
      if (onUpdate) {
        onUpdate({
          propertyDescription: {
            description: editedDescription
          }
        });
      }
    } catch (error) {
      console.error('Error updating property description:', error);
      toast.error('Failed to update property description');
    }
  };

  return (
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">About this Property</h2>
        {isEditable && (
          <button
            onClick={() => {
              setEditedDescription(description);
              setIsEditDialogOpen(true);
            }}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="relative">
        <p className="text-neutral-700 dark:text-neutral-400">
          {description.trim() || 'No description provided'}
        </p>
      </div>

      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        size="sm"
        title="Edit Property Description"
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
              onClick={handleUpdateDescription}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                border border-transparent rounded-md hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={6}
                placeholder="Describe your property..."
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
