import { useState } from 'react';
import { UserIcon } from '../Icons/UserIcon';
import { PhoneIcon } from '../Icons/PhoneIcon';
import { EmailIcon } from '../Icons/EmailIcon';
import EditIcon from '../Icons/EditIcon';
import { ContactDetails } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';
import { EnvelopeIcon } from '../Icons/EnvelopeIcon';
import { StarIcon } from '../Icons/StarIcon';

interface Props {
  agistmentId?: string;
  contactDetails: ContactDetails;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

export const AgistmentContact = ({ agistmentId, contactDetails, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editForm, setEditForm] = useState({
    name: contactDetails.name,
    email: contactDetails.email,
    number: contactDetails.number
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Email validation - must be valid if provided
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation - must be exactly 10 digits if provided
    if (editForm.number) {
      const digitsOnly = editForm.number.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.number = 'Phone number must be exactly 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateContact = async () => {
    if (!agistmentId) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const updatedAgistment = await agistmentService.updateContact(agistmentId, {
        contactDetails: editForm
      });
      onUpdate?.(updatedAgistment);
      setIsEditDialogOpen(false);
      toast.success('Contact details updated successfully');
    } catch (error) {
      console.error('Error updating contact details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update contact details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-title-wrapper mb-4">
        <h3 className="text-subtitle">Contact Details</h3>
        {isEditable && (
          <button
            onClick={() => {
              setEditForm({
                name: contactDetails.name,
                email: contactDetails.email,
                number: contactDetails.number
              });
              setIsEditDialogOpen(true);
            }}
            className="btn-edit"
          >
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-body">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-neutral-500" />
            <span>{contactDetails.name}</span>
          </div>
        </div>
        <div className="text-body">
          <div className="flex items-center gap-2">
            <EmailIcon className="w-5 h-5 text-neutral-500" />
            <a href={`mailto:${contactDetails.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {contactDetails.email}
            </a>
          </div>
        </div>
        {contactDetails.number && (
          <div className="text-body">
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-neutral-500" />
              <a href={`tel:${contactDetails.number}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                {contactDetails.number}
              </a>
            </div>
          </div>
        )}
      </div>

      {isEditable && (
        <Modal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          size="sm"
          title="Edit Contact Details"
          footerContent={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContact}
                disabled={isSubmitting}
                className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          }
        >
          <div className="form-group">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={editForm.number}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, number: e.target.value }));
                  if (errors.number) {
                    setErrors(prev => ({ ...prev, number: '' }));
                  }
                }}
                className={`form-input ${errors.number ? 'border-red-500' : ''}`}
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-500">{errors.number}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
