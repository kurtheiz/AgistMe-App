import { useState, useMemo, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Agistment } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';

interface Props {
  agistmentId: string;
  description: string;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentDescription = ({ agistmentId, description, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ description });
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(description);

  // Reset form when modal opens
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditForm({ description });
      setOriginalDescription(description);
    }
  }, [isEditDialogOpen, description]);

  // Create a hash of the current form state compared to original
  const contentHash = useMemo(() => {
    return JSON.stringify({
      current: editForm.description,
      original: originalDescription
    });
  }, [editForm.description, originalDescription]);

  const handleUpdateDescription = async () => {
    if (!agistmentId || !isDirty) return;
    
    setIsUpdating(true);
    try {
      await agistmentService.updatePropertyDescription(agistmentId, {
        description: editForm.description
      });
      
      setIsEditDialogOpen(false);
      toast.success('Property description updated successfully');
      
      if (onUpdate) {
        onUpdate({
          propertyDescription: {
            description: editForm.description
          }
        });
      }
    } catch (error) {
      console.error('Error updating property description:', error);
      toast.error('Failed to update property description');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-title-wrapper mb-2">
        <h3 className="text-subtitle">About this Property</h3>
        {isEditable && (
          <button
            onClick={() => {
              setIsEditDialogOpen(true);
            }}
            className="btn-edit"
          >
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="text-body whitespace-pre-wrap">
        {description || 'No description provided'}
      </div>

      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        size="md"
        title="Edit Property Description"
        contentHash={contentHash}
        onDirtyChange={setIsDirty}
        isUpdating={isUpdating}
        footerContent={({ isUpdating }) => (
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleUpdateDescription}
              className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
                !isDirty || isUpdating
                  ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                  : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
              }`}
              disabled={!isDirty || isUpdating}
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <div className="input-wrapper">
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ description: e.target.value })}
                rows={6}
                className="form-textarea"
                placeholder="Describe your property..."
              />
              <button
                type="button"
                className="input-delete-button"
                onClick={() => setEditForm({ description: '' })}
                aria-label="Clear description"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
