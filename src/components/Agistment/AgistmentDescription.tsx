import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
  const [editForm, setEditForm] = useState({ description });

  const handleUpdateDescription = async () => {
    if (!agistmentId) return;
    
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
    }
  };

  return (
    <div className="section-container">
      <div className="section-title-wrapper mb-2">
        <h3 className="text-subtitle">About this Property</h3>
        {isEditable && (
          <button
            onClick={() => {
              setEditForm({ description: description });
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
        footerContent={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateDescription}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="form-group">
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ description: e.target.value })}
              rows={6}
              className="form-textarea"
              placeholder="Describe your property..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
