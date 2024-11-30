import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal'; 
import { Pencil } from 'lucide-react';
import { MapPinIcon } from '../Icons';
import { Location } from '../../types/agistment';
import toast from 'react-hot-toast';
import { getGoogleMapsUrl } from '../../utils/location';
import { agistmentService } from '../../services/agistment.service';
import { Loader2 } from 'lucide-react';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { Suburb, LocationType } from '../../types/suburb';

interface Props {
  agistmentId?: string;
  location: Location;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

interface LocationForm extends Location {
  suburbId?: string;
}

export const AgistmentLocation = ({ agistmentId, location, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<LocationForm>({ ...location });
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSuburbs, setSelectedSuburbs] = useState<Suburb[]>([]);

  useEffect(() => {
    if (isEditDialogOpen) {
      setEditForm({ ...location });
      setIsDirty(false);
      // Reset selected suburbs
      if (location.suburb && location.state && location.postcode) {
        setSelectedSuburbs([{
          id: editForm.suburbId || '',
          suburb: location.suburb,
          state: location.state,
          postcode: location.postcode,
          region: location.region,
          geohash: '',
          locationType: LocationType.SUBURB
        }]);
      } else {
        setSelectedSuburbs([]);
      }
    }
  }, [isEditDialogOpen, location]);

  const handleUpdateLocation = async () => {
    if (!agistmentId || !isDirty) return;

    setIsUpdating(true);
    try {
      await agistmentService.updatePropertyLocation(agistmentId, {
        location: editForm
      });
      setIsEditDialogOpen(false);
      toast.success('Location updated successfully');
      
      if (onUpdate) {
        onUpdate({
          propertyLocation: {
            location: editForm
          }
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
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
        suburbId: suburb.id,
        geohash: suburb.geohash
      }));
      setSelectedSuburbs(suburbs);
      setIsDirty(true);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <div className="flex items-center gap-2 text-body">
            <a
              href={getGoogleMapsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-800 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
              title="Open in Google Maps"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div className="flex items-center gap-1">
              <span>{location.address}, {location.suburb}, {location.state} {location.postcode}</span>
              {isEditable && (
                <button
                  onClick={() => setIsEditDialogOpen(true)}
                  className="btn-edit ml-2"
                >
                  <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Location"
        size="sm"
        contentHash={JSON.stringify(editForm)}
        onDirtyChange={setIsDirty}
        isUpdating={isUpdating}
        footerContent={({ isUpdating }) => (
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleUpdateLocation}
              className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
                !isDirty || isUpdating
                  ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                  : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
              }`}
              disabled={!isDirty || isUpdating}
            >
              {isUpdating ? (
                <><Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />Saving...</>
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
              Street Address
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, address: e.target.value }));
                  setIsDirty(true);
                }}
                className="form-input"
                placeholder="Enter street address"
              />
              <button
                type="button"
                className="input-delete-button"
                onClick={() => {
                  setEditForm(prev => ({ ...prev, address: '' }));
                  setIsDirty(true);
                }}
                aria-label="Clear address"
              >
                ✕
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Location
            </label>
            <SuburbSearch
              selectedSuburbs={selectedSuburbs}
              onSuburbsChange={handleSuburbChange}
              multiple={false}
              includeRegions={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Suburb
              </label>
              <input
                type="text"
                value={editForm.suburb}
                readOnly
                className="form-input bg-neutral-100 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Region
              </label>
              <input
                type="text"
                value={editForm.region}
                readOnly
                className="form-input bg-neutral-100 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={editForm.state}
                readOnly
                className="form-input bg-neutral-100 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={editForm.postcode}
                readOnly
                className="form-input bg-neutral-100 dark:bg-neutral-800"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
