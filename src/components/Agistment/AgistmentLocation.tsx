import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Pencil } from 'lucide-react';
import { MapPinIcon } from '../Icons';
import { Location } from '../../types/agistment';
import toast from 'react-hot-toast';
import { getGoogleMapsUrl } from '../../utils/location';
import { agistmentService } from '../../services/agistment.service';

interface Props {
  agistmentId?: string;
  location: Location;
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: any) => void;
}

export const AgistmentLocation = ({ agistmentId, location, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    address: location.address,
    suburb: location.suburb,
    state: location.state,
    postcode: location.postcode,
    region: location.region
  });

  const handleUpdateLocation = async () => {
    if (!agistmentId) return;
    
    try {
      const updatedAgistment = await agistmentService.updatePropertyLocation(agistmentId, {
        location: editForm
      });
      onUpdate?.(updatedAgistment);
      setIsEditDialogOpen(false);
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="group relative">
          <div className="section-title-wrapper mb-2">
            <h3 className="text-subtitle">Location</h3>
            {isEditable && (
              <button
                onClick={() => {
                  setEditForm({
                    address: location.address,
                    suburb: location.suburb,
                    state: location.state,
                    postcode: location.postcode,
                    region: location.region
                  });
                  setIsEditDialogOpen(true);
                }}
                className="btn-edit"
              >
                <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
          <div className="flex items-left gap-2 text-body mt-1">
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
            <div className="flex justify-between items-center">
              <div className="text-body">
                {location.address}, {location.suburb}, {location.region}, {location.state}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditable && (
        <Dialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          className="modal-container"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="modal-overlay" />
            <div className="modal-content">
              <h3 className="modal-title">
                Edit Location
              </h3>
              <div className="form-group">
                <div>
                  <label className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Suburb
                  </label>
                  <input
                    type="text"
                    value={editForm.suburb}
                    onChange={(e) => setEditForm(prev => ({ ...prev, suburb: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={editForm.postcode}
                    onChange={(e) => setEditForm(prev => ({ ...prev, postcode: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Region
                  </label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLocation}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
