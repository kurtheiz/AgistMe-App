import { useState } from 'react';
import { Pencil, Mail, Phone, User, Facebook, Instagram, Globe, MapPinIcon, Loader2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Agistment, AgistmentContact, Location } from '../../types/agistment';
import { agistmentService } from '../../services/agistment.service';
import toast from 'react-hot-toast';
import { getGoogleMapsUrl } from '../../utils/location';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { Suburb, LocationType } from '../../types/suburb';
import NumberStepper from '../shared/NumberStepper';

interface Props {
  agistmentId: string;
  basicInfo: Agistment['basicInfo'];
  location: Location;
  contactDetails: AgistmentContact;
  socialMedia: { type: string; link: string; }[];
  isEditable?: boolean;
  showEnquireButton?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

interface EditForm {
  name: string;
  propertySize: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  region?: string;
  suburbId?: string;
  contactName: string;
  contactEmail: string;
  contactNumber: string;
}

export const AgistmentHeader = ({
  agistmentId,
  basicInfo,
  location,
  contactDetails,
  socialMedia,
  isEditable = false,
  showEnquireButton = false,
  onUpdate
}: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: basicInfo.name,
    propertySize: basicInfo.propertySize,
    address: location.address,
    suburb: location.suburb,
    state: location.state,
    postcode: location.postcode,
    region: location.region,
    suburbId: location.suburbId,
    contactName: contactDetails.contactDetails.name,
    contactEmail: contactDetails.contactDetails.email,
    contactNumber: contactDetails.contactDetails.number
  });
  const [selectedSuburbs, setSelectedSuburbs] = useState<Suburb[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateAll = async () => {
    if (!agistmentId || !isDirty) return;

    setIsUpdating(true);
    try {
      // Update basic info
      await agistmentService.updateBasicInfo(agistmentId, {
        name: editForm.name,
        propertySize: editForm.propertySize
      });

      // Update location
      await agistmentService.updatePropertyLocation(agistmentId, {
        location: {
          address: editForm.address,
          suburb: editForm.suburb,
          state: editForm.state,
          postcode: editForm.postcode,
          region: editForm.region
        }
      });

      // Update contact details
      await agistmentService.updateContact(agistmentId, {
        contactDetails: {
          name: editForm.contactName,
          email: editForm.contactEmail,
          number: editForm.contactNumber
        }
      });

      setIsEditDialogOpen(false);
      toast.success('Property details updated successfully');

      if (onUpdate) {
        onUpdate({
          basicInfo: {
            name: editForm.name,
            propertySize: editForm.propertySize
          },
          location: {
            address: editForm.address,
            suburb: editForm.suburb,
            state: editForm.state,
            postcode: editForm.postcode,
            region: editForm.region,
            suburbId: editForm.suburbId
          },
          contact: {
            contactDetails: {
              name: editForm.contactName,
              email: editForm.contactEmail,
              number: editForm.contactNumber
            }
          }
        });
      }
    } catch (error) {
      console.error('Error updating property details:', error);
      toast.error('Failed to update property details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuburbChange = (suburbs: Suburb[]) => {
    const suburb = suburbs[0];
    if (suburb) {
      setEditForm(prev => ({
        ...prev,
        suburb: suburb.suburb,
        state: suburb.state,
        postcode: suburb.postcode,
        region: suburb.region || '',
        suburbId: suburb.id
      }));
      setSelectedSuburbs(suburbs);
      setIsDirty(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Name and Size */}
      <div className="section-container">
        <div className="section-header">
          <div>
            <div className="section-title-wrapper">
              <div className="flex flex-col">
                <h2 className="text-title">{basicInfo.name}</h2>
                <span className="text-sm text-neutral-500">
                  {basicInfo.propertySize > 0 ? `Situated on ${basicInfo.propertySize} acres` : ''}
                </span>
              </div>
              {isEditable && (
                <button
                  onClick={() => setIsEditDialogOpen(true)}
                  className="btn-edit"
                >
                  <Pencil className="w-5 h-5 text-neutral-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location and Contact */}
      <div className="flex flex-col gap-4">
        {/* Location */}
        <div>
          <a
            href={getGoogleMapsUrl(location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title="Open in Google Maps"
          >
            <span>{location.address}, {location.suburb}, {location.state} {location.postcode}</span>
          </a>
          {location.region && (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Located in the {location.region}
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="flex flex-col space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">{contactDetails.contactDetails.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <a href={`mailto:${contactDetails.contactDetails.email}`} className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline transition-colors">
              {contactDetails.contactDetails.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <a href={`tel:${contactDetails.contactDetails.number}`} className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline transition-colors">
              {contactDetails.contactDetails.number}
            </a>
          </div>
          {/* Social Media Links - Hidden for now */}
          {/* <div className="flex items-center gap-3 mt-2">
            {socialMedia.map((social) => {
              const Icon = social.type === 'facebook' ? Facebook :
                         social.type === 'instagram' ? Instagram : Globe;
              return (
                <a
                  key={social.type}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div> */}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditable && (
        <Modal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Property Details"
          size="lg"
          onDirtyChange={setIsDirty}
          isUpdating={isUpdating}
          footerContent={({ isUpdating }) => (
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleUpdateAll}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !isDirty || isUpdating
                    ? 'text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed'
                    : 'text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
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
          <div className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Property Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
              <div>
                <NumberStepper
                  label="Property Size"
                  value={editForm.propertySize}
                  onChange={(value) => {
                    setEditForm(prev => ({ ...prev, propertySize: value }));
                    setIsDirty(true);
                  }}
                  min={0}
                  step={1}
                  formatValue={(value) => `${value} acres`}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Location</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, address: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Location</label>
                <SuburbSearch
                  selectedSuburbs={selectedSuburbs}
                  onSuburbsChange={handleSuburbChange}
                  multiple={false}
                  includeRegions={false}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Suburb</label>
                  <input
                    type="text"
                    value={editForm.suburb}
                    readOnly
                    className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editForm.postcode}
                    readOnly
                    className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    readOnly
                    className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Region</label>
                  <input
                    type="text"
                    value={editForm.region || ''}
                    readOnly
                    className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Contact Details</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, contactName: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, contactEmail: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.contactNumber}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, contactNumber: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="form-input bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
