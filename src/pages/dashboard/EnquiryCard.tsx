import { EnquiryResponse } from '../../types/enquiry';
import { Mail, Phone, MessageCircle, User2, Calendar, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { Disclosure, Menu } from '@headlessui/react';
import { useUpdateEnquiryStatus } from '../../hooks/useEnquiries';

const calculateAge = (dateOfBirth: string | undefined): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface EnquiryCardProps {
  enquiry: EnquiryResponse;
}

export const EnquiryCard = ({ enquiry }: EnquiryCardProps) => {
  const { mutate: updateStatus } = useUpdateEnquiryStatus();

  const handleStatusUpdate = async (update: { read?: boolean; status?: string }) => {
    updateStatus({ enquiryId: enquiry.id, update });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border ${enquiry.read ? 'border-neutral-200' : 'border-primary-200'} relative`}
    >
      {!enquiry.read && (
        <div className="absolute -top-2 -left-2 bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
          New
        </div>
      )}
      <div className="px-4 py-3 border-b border-neutral-100">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-900">{enquiry.agistment_name}</h3>
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center p-1 text-neutral-500 hover:text-neutral-700">
                <MoreVertical className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-neutral-200 focus:outline-none z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleStatusUpdate({ read: !enquiry.read })}
                        className={`${
                          active ? 'bg-neutral-100' : ''
                        } w-full text-left px-4 py-2 text-sm text-neutral-700`}
                      >
                        {enquiry.read ? 'Mark as unread' : 'Mark as read'}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleStatusUpdate({ status: 'ACKNOWLEDGED' })}
                        className={`${
                          active ? 'bg-neutral-100' : ''
                        } w-full text-left px-4 py-2 text-sm text-neutral-700`}
                      >
                        Remove
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(enquiry.created_at).toLocaleString('en-AU', { 
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Contact Info from Enquiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User2 className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">
              {enquiry.first_name} {enquiry.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400" />
            <a 
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Thanks for your Enquiry about ${enquiry.agistment_name}`)}`} 
              className="text-sm text-primary-600 hover:text-primary-700"
              onClick={(e) => e.stopPropagation()}
            >
              {enquiry.email}
            </a>
          </div>
          {enquiry.mobile_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <a 
                href={`tel:${enquiry.mobile_phone}`} 
                className="text-sm text-primary-600 hover:text-primary-700"
                onClick={(e) => e.stopPropagation()}
              >
                {enquiry.mobile_phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{enquiry.enquiry_type}</span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{enquiry.message}</p>
        </div>

        {/* Bio Preview if available */}
        {enquiry.bio && (
          <div className="border-t border-neutral-100 pt-4 mt-4">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button 
                    className="w-full flex items-center justify-between text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-neutral-900">Profile Information</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Profile Shared
                      </span>
                    </div>
                    {open ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </Disclosure.Button>
                  
                  <Disclosure.Panel className="mt-4">
                    <div className="flex items-start gap-4">
                      {enquiry.bio?.profilePhoto && (
                        <img 
                          src={enquiry.bio.profilePhoto} 
                          alt={`${enquiry.bio?.firstName} ${enquiry.bio?.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <User2 className="w-4 h-4 text-neutral-400" />
                            <span>{enquiry.bio?.firstName} {enquiry.bio?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-neutral-400" />
                            <a 
                              href={`mailto:${enquiry.bio?.email}`}
                              className="text-primary-600 hover:text-primary-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {enquiry.bio?.email}
                            </a>
                          </div>
                          <p className="mt-2">{enquiry.bio?.suburb}, {enquiry.bio?.state}</p>
                          {enquiry.bio?.dateOfBirth && (
                            <p className="mt-1">Age: {calculateAge(enquiry.bio.dateOfBirth)} years</p>
                          )}
                          <p className="mt-2 text-neutral-500">{enquiry.bio?.comments || 'No additional comments'}</p>
                        </div>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryCard;
