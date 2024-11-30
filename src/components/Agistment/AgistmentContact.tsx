import { useState, useEffect } from 'react';
import { Pencil, Mail, Phone, User, Loader2, Facebook, Instagram, Globe } from 'lucide-react';
import { ContactDetails } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';

interface SocialMediaLink {
  type: string;
  link: string;
}

interface Props {
  agistmentId?: string;
  contactDetails: ContactDetails;
  socialMedia: SocialMediaLink[];
  isEditable?: boolean;
  showEnquireButton?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

export const AgistmentContact = ({ 
  agistmentId, 
  contactDetails, 
  socialMedia, 
  isEditable = false, 
  showEnquireButton = false,
  onUpdate 
}: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: contactDetails.name,
    email: contactDetails.email,
    number: contactDetails.number
  });
  const [originalForm, setOriginalForm] = useState({
    name: contactDetails.name,
    email: contactDetails.email,
    number: contactDetails.number
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isEditDialogOpen) {
      setEditForm({
        name: contactDetails.name,
        email: contactDetails.email,
        number: contactDetails.number
      });
      setOriginalForm({
        name: contactDetails.name,
        email: contactDetails.email,
        number: contactDetails.number
      });
    }
  }, [isEditDialogOpen, contactDetails]);

  const contentHash = JSON.stringify(editForm);

  const isDirty = JSON.stringify(editForm) !== JSON.stringify(originalForm);

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

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateContact = async () => {
    if (!agistmentId || !isDirty) return;

    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      const updatedAgistment = await agistmentService.updateContact(agistmentId, {
        contactDetails: editForm
      });
      setIsEditDialogOpen(false);
      toast.success('Contact details updated successfully');
      
      if (onUpdate) {
        onUpdate(updatedAgistment);
      }
    } catch (error) {
      console.error('Error updating contact details:', error);
      toast.error('Failed to update contact details');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-title-wrapper mb-4">
        <h3 className="text-subtitle">Contact Details</h3>
        {isEditable && (
          <button
            onClick={() => {
              setIsEditDialogOpen(true);
            }}
            className="btn-edit"
          >
            <Pencil className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-body">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-body">{contactDetails.name}</span>
          </div>
        </div>
        <div className="text-body">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <a href={`mailto:${contactDetails.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {contactDetails.email}
            </a>
          </div>
        </div>
        {contactDetails.number && (
          <div className="text-body">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <a href={`tel:${contactDetails.number}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                {contactDetails.number}
              </a>
            </div>
          </div>
        )}

        {/* Social media section - always show the container for spacing */}
        <div className="text-body sm:col-span-2">
          {socialMedia && socialMedia.some(social => social.link) && (
            <div className="flex flex-wrap gap-2">
              {socialMedia
                .filter(social => social.link)
                .map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title={social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
                  >
                    {social.type === 'INSTA' ? (
                      <Instagram className="w-5 h-5" />
                    ) : social.type === 'FB' ? (
                      <Facebook className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </a>
                ))}
            </div>
          )}
        </div>

        {/* Enquire Now Button */}
        {showEnquireButton && (
          <div className="sm:col-span-2 mt-4">
            <button 
              className={`w-full px-4 py-3 font-medium rounded-lg text-center transition-colors ${
                isEditable 
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-75' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              disabled={isEditable}
              title={isEditable ? "Not available while editing" : "Enquire Now"}
            >
              Enquire Now
            </button>
          </div>
        )}
      </div>

      {isEditable && (
        <Modal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Contact Details"
          size="md"
          contentHash={contentHash}
          isUpdating={isUpdating}
          footerContent={({ isUpdating }) => (
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleUpdateContact}
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
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm({
                    ...editForm,
                    name: e.target.value
                  });
                }}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => {
                  setEditForm({
                    ...editForm,
                    email: e.target.value
                  });
                }}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.number}
                onChange={(e) => {
                  setEditForm({
                    ...editForm,
                    number: e.target.value
                  });
                }}
                className="form-input"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
