import { useState } from 'react';
import { UserIcon } from '../Icons/UserIcon';
import { PhoneIcon } from '../Icons/PhoneIcon';
import { EmailIcon } from '../Icons/EmailIcon';
import EditIcon from '../Icons/EditIcon';
import { ContactDetails } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';

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
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Contact Details</h3>
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
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      {!contactDetails.name && !contactDetails.email && !contactDetails.number ? (
        <div className="text-neutral-500 dark:text-neutral-400">None provided</div>
      ) : (
        <>
          {contactDetails.name && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
              <span className="text-neutral-900 dark:text-white font-medium">
                {contactDetails.name}
              </span>
            </div>
          )}
          {contactDetails.number && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
              <span className="text-neutral-700 dark:text-neutral-400">
                {contactDetails.number}
              </span>
            </div>
          )}
          {contactDetails.email && (
            <div className="flex items-center gap-2">
              <EmailIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
              <span className="text-neutral-700 dark:text-neutral-400">
                {contactDetails.email}
              </span>
            </div>
          )}
        </>
      )}

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
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 
                  bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 
                  rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContact}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-primary-600 
                  border border-transparent rounded-md hover:bg-primary-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${editForm.name ? 'pr-8' : ''}`}
                />
                {editForm.name && (
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, name: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={editForm.number}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, number: e.target.value }));
                    if (errors.number) {
                      setErrors(prev => ({ ...prev, number: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 border ${errors.number ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${editForm.number ? 'pr-8' : ''}`}
                />
                {editForm.number && (
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, number: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {errors.number && (
                <p className="mt-1 text-sm text-red-500">{errors.number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${editForm.email ? 'pr-8' : ''}`}
                />
                {editForm.email && (
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, email: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
