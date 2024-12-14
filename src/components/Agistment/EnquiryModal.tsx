import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { useAuth } from '@clerk/clerk-react';
import { profileService } from '../../services/profile.service';
import { agistmentService } from '../../services/agistment.service';
import { Popover } from '@headlessui/react';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { EnquiryRequest } from '../../types/enquiry';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agistmentName: string;
  agistmentId: string;
}

interface EnquiryForm {
  first_name: string;
  last_name: string;
  mobile_phone: string;
  email: string;
  message: string;
  includeBio: boolean;
  profileId?: string;
}

export function EnquiryModal({ isOpen, onClose, agistmentName, agistmentId }: EnquiryModalProps) {
  const { isSignedIn } = useAuth();
  const [form, setForm] = useState<EnquiryForm>({
    first_name: '',
    last_name: '',
    mobile_phone: '',
    email: '',
    message: '',
    includeBio: false,
    profileId: undefined
  });

  const [errors, setErrors] = useState<{
    email?: string;
    message?: string;
    mobile_phone?: string;
  }>({});

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn) return;
      
      try {
        const profileData = await profileService.getProfile();
        setForm(prev => ({
          ...prev,
          first_name: profileData.firstName || '',
          last_name: profileData.lastName || '',
          email: profileData.email || '',
          mobile_phone: profileData.mobile || '',
          includeBio: profileData.showProfileInEnquiry ?? false,
          profileId: profileData.id
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [isSignedIn]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isValidMobile = (mobile: string) => {
    const mobileRegex = /^\d{10}$/;
    return mobile.trim() === '' || mobileRegex.test(mobile.trim());
  };

  const isFormValid = form.message.trim() !== '' && isValidEmail(form.email) && isValidMobile(form.mobile_phone);

  const validateFields = () => {
    const newErrors: { email?: string; message?: string; mobile_phone?: string; } = {};

    // Required fields validation
    if (!form.email?.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!form.message?.trim()) {
      newErrors.message = 'Message is required';
    }

    if (form.mobile_phone && form.mobile_phone.trim()) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(form.mobile_phone)) {
        newErrors.mobile_phone = 'Mobile number must be exactly 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }

    try {
      const enquiryRequest: EnquiryRequest = {
        email: form.email,
        message: form.message,
        ...(form.first_name && { first_name: form.first_name }),
        ...(form.last_name && { last_name: form.last_name }),
        ...(form.mobile_phone && { mobile_phone: form.mobile_phone }),
        ...(form.includeBio && form.profileId ? { bioShareId: form.profileId } : {})
      };

      await agistmentService.submitEnquiry(agistmentId, enquiryRequest);
      toast.success('Enquiry sent successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // For mobile, only allow numbers
    if (name === 'mobile_phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enquire about ${agistmentName}`}
      size="md"
      isUpdating={false}
      actionIconType="SAVE"
      onAction={() => {
        const event = new Event('submit') as unknown as React.FormEvent;
        handleSubmit(event);
      }}
      disableAction={!isFormValid}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Share my bio with enquiry
              </label>
              <Popover className="relative">
                <Popover.Button className="focus:outline-none">
                  <Info className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 mt-1 -translate-x-1/2 left-1/2">
                  <div className="bg-white dark:bg-neutral-800 p-2 rounded-md shadow-lg text-sm text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    All your bio information will be shared with this enquiry
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, includeBio: !prev.includeBio }))}
              disabled={!isSignedIn}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.includeBio ? 'bg-primary-600' : 'bg-neutral-200'} ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.includeBio ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
          {!isSignedIn && (
            <p className="mt-1 text-sm text-neutral-500">Sign in to share your bio</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleInputChange}
                className="form-input form-input-compact"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleInputChange}
                className="form-input form-input-compact"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile_phone"
              name="mobile_phone"
              value={form.mobile_phone}
              onChange={handleInputChange}
              className={`form-input form-input-compact ${errors.mobile_phone ? 'border-red-500' : ''}`}
              placeholder="04XXXXXXXX"
            />
            {errors.mobile_phone && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile_phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={form.email}
              onChange={handleInputChange}
              className={`form-input form-input-compact ${errors.email ? 'border-red-500' : ''}`}
              placeholder="name@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              value={form.message}
              onChange={handleInputChange}
              rows={6}
              className={`form-input form-input-compact min-h-[150px] resize-none ${errors.message ? 'border-red-500' : ''}`}
              placeholder="Enter your message"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
