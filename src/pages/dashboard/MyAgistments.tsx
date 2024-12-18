import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { agistmentService } from '../../services/agistment.service';
import { PageToolbar } from '../../components/PageToolbar';
import { AgistmentSearchResponse } from '../../types/search';
import { AgistmentResponse } from '../../types/agistment';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { AgistmentHeaderModal } from '../../components/Agistment/AgistmentHeaderModal';
import { AgistmentPaddocksModal } from '../../components/Agistment/AgistmentPaddocksModal';
import { AgistmentRidingFacilitiesModal } from '../../components/Agistment/AgistmentRidingFacilitiesModal';
import { AgistmentFacilitiesModal } from '../../components/Agistment/AgistmentFacilitiesModal';
import { AgistmentCareOptionsModal } from '../../components/Agistment/AgistmentCareOptionsModal';
import { AgistmentServicesModal } from '../../components/Agistment/AgistmentServicesModal';
import { AgistmentPhotosModal } from '../../components/Agistment/AgistmentPhotosModal';
import toast from 'react-hot-toast';
import PropertyCard from '../../components/PropertyCard';

type EditModalType = 'header' | 'paddocks' | 'riding' | 'facilities' | 'care' | 'services' | 'photos' | null;

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agistmentToDelete, setAgistmentToDelete] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ type: EditModalType; agistment: AgistmentResponse } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(response.results || []);
      } catch (error) {
        console.error('Error fetching agistments:', error);
        toast.error('Failed to load agistments');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAgistments();
    }
  }, [userId]);

  const handleDelete = async () => {
    if (!agistmentToDelete) return;

    try {
      await agistmentService.deleteAgistment(agistmentToDelete);
      setAgistments(agistments.filter(a => a.id !== agistmentToDelete));
      toast.success('Agistment deleted successfully');
    } catch (error) {
      console.error('Error deleting agistment:', error);
      toast.error('Failed to delete agistment');
    } finally {
      setAgistmentToDelete(null);
    }
  };

  const handleUpdateAgistment = async (agistmentId: string, updatedData: Partial<AgistmentResponse>, keepModalOpen = false) => {
    if (!agistmentId || isUpdating) return;

    setIsUpdating(true);
    try {
      const currentAgistment = agistments.find(a => a.id === agistmentId);
      if (!currentAgistment) {
        throw new Error('Agistment not found');
      }

      const mergedAgistment = {
        ...currentAgistment,
        ...updatedData
      };

      await agistmentService.updateAgistment(agistmentId, mergedAgistment);
      
      const updatedAgistments = await agistmentService.getMyAgistments();
      setAgistments(updatedAgistments.results || []);
      
      toast.success('Agistment updated successfully');
      
      // Only close modal if keepModalOpen is false
      if (!keepModalOpen) {
        setEditModal(null);
      }
    } catch (error) {
      console.error('Error updating agistment:', error);
      toast.error('Failed to update agistment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityToggle = async (agistmentId: string, currentStatus: string) => {
    // Only validate when publishing (changing from HIDDEN to PUBLISHED)
    if (currentStatus === 'HIDDEN') {
      const agistment = agistments.find(a => a.id === agistmentId);
      if (!agistment) return;

      const errors: string[] = [];

      // Basic Info Validation
      if (!agistment.basicInfo?.name || agistment.basicInfo.name.length < 3 || agistment.basicInfo.name === 'New Agistment') {
        errors.push('Basic Info: Name must be at least 3 characters and cannot be "New Agistment"');
      }

      if (!agistment.propertyLocation?.location?.suburb || 
          !agistment.propertyLocation?.location?.state || 
          !agistment.propertyLocation?.location?.region || 
          !agistment.propertyLocation?.location?.postcode) {
        errors.push('Basic Info: Suburb, state, region, and postcode are required');
      }

      // Paddocks Validation
      const hasPaddocks = agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 ||
                         agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 ||
                         agistment.paddocks?.groupPaddocks?.totalPaddocks > 0;
      if (!hasPaddocks) {
        errors.push('Paddocks: At least one paddock type must have paddocks');
      }

      // Care Options Validation
      const hasCareOption = agistment.care?.selfCare?.available ||
                           agistment.care?.partCare?.available ||
                           agistment.care?.fullCare?.available;
      if (!hasCareOption) {
        errors.push('Care: At least one care option must be available');
      }

      // Photos Validation
      if (!agistment.photoGallery?.photos || agistment.photoGallery.photos.length === 0) {
        errors.push('Photos: At least one photo is required');
      }

      if (errors.length > 0) {
        toast.error(
          <div>
            <p className="font-semibold mb-2">Please fix sections with errors before unhiding</p>
            <p className="text-sm text-red-400">Look for the error indicators on each section button</p>
          </div>
        );
        return;
      }
    }

    handleUpdateAgistment(agistmentId, {
      status: currentStatus === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
    });
  };

  const handlePreview = (agistment: any) => {
    navigate(`/dashboard/agistments/${agistment.id}`);
  };

  const checkSectionValidation = (agistment: AgistmentSearchResponse, section: 'header' | 'paddocks' | 'care' | 'photos') => {
    switch (section) {
      case 'header':
        return !(!agistment.basicInfo?.name || 
                agistment.basicInfo.name.length < 3 || 
                agistment.basicInfo.name === 'New Agistment' ||
                !agistment.propertyLocation?.location?.suburb || 
                !agistment.propertyLocation?.location?.state || 
                !agistment.propertyLocation?.location?.region || 
                !agistment.propertyLocation?.location?.postcode);
      case 'paddocks':
        return !!(agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 ||
                 agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 ||
                 agistment.paddocks?.groupPaddocks?.totalPaddocks > 0);
      case 'care':
        return !!(agistment.care?.selfCare?.available ||
                 agistment.care?.partCare?.available ||
                 agistment.care?.fullCare?.available);
      case 'photos':
        return !!(agistment.photoGallery?.photos && agistment.photoGallery.photos.length > 0);
      default:
        return true;
    }
  };

  const renderEditButtons = (agistment: AgistmentSearchResponse) => (
    <div className="bg-neutral-50 border-t border-neutral-200">
      <div className="text-center text-sm text-neutral-600 pt-4">Edit sections</div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          onClick={() => setEditModal({ type: 'header', agistment: agistment as AgistmentResponse })}
          className="button-toolbar relative"
        >
          Basic Info
          {!checkSectionValidation(agistment, 'header') && (
            <div className="absolute -top-1 -right-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </button>
        <button
          onClick={() => setEditModal({ type: 'paddocks', agistment: agistment as AgistmentResponse })}
          className="button-toolbar relative"
        >
          Paddocks
          {!checkSectionValidation(agistment, 'paddocks') && (
            <div className="absolute -top-1 -right-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </button>
        <button
          onClick={() => setEditModal({ type: 'riding', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Riding Facilities
        </button>
        <button
          onClick={() => setEditModal({ type: 'facilities', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Facilities
        </button>
        <button
          onClick={() => setEditModal({ type: 'care', agistment: agistment as AgistmentResponse })}
          className="button-toolbar relative"
        >
          Care
          {!checkSectionValidation(agistment, 'care') && (
            <div className="absolute -top-1 -right-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </button>
        <button
          onClick={() => setEditModal({ type: 'photos', agistment: agistment as AgistmentResponse })}
          className="button-toolbar relative"
        >
          Photos
          {!checkSectionValidation(agistment, 'photos') && (
            <div className="absolute -top-1 -right-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      <div className={`text-sm font-medium text-center py-1.5 ${
  agistment.status === 'PUBLISHED' 
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-orange-100 text-orange-700'
} rounded`}>
  {agistment.status === 'PUBLISHED' ? 'Available in search results' : 'Hidden from search results'}
</div>
      <div className="border-t border-neutral-200 p-4 flex gap-2 bg-white">
        <button
          onClick={() => handlePreview(agistment)}
          className="button-toolbar"
        >
          Preview
        </button>
        <button
          onClick={() => handleVisibilityToggle(agistment.id, agistment.status)}
          className="button-toolbar"
        >
          {agistment.status === 'PUBLISHED' ? (
            <><span>Hide</span></>
          ) : (
            <><span>Unhide</span></>
          )}
        </button>
        
        <button
          onClick={() => setAgistmentToDelete(agistment.id)}
          className="button-toolbar text-red-600 ml-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="back-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="back-button-text">Back</span>
                </button>
                <span className="breadcrumb-separator">|</span>
                <div className="breadcrumb-container">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="breadcrumb-link"
                  >
                    Dashboard
                  </button>
                  <span className="breadcrumb-chevron">&gt;</span>
                  <span>My Agistments</span>
                </div>
              </div>
            </div>
          </div>
        }
      />
      
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="pb-8 pt-4 md:px-4">
            <div className="mb-4 text-sm text-neutral-600 px-4">
              {agistments.length} {agistments.length === 1 ? 'agistment' : 'agistments'}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agistments.map((agistment) => (
                <div key={agistment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <PropertyCard
                    agistment={agistment}
                    onClick={() => navigate(`/dashboard/agistments/${agistment.id}`)}
                    noShadow
                    disableFavorite
                    showStatus
                  />
                  
                  {renderEditButtons(agistment)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!agistmentToDelete}
        onClose={() => setAgistmentToDelete(null)}
        onConfirm={handleDelete}
        title="Cancel Agistment"
        message="Are you sure you want to cancel your subscription for this agistment?"
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        disableOutsideClick={true}
      />

      {editModal?.type === 'photos' && editModal.agistment && (
        <AgistmentPhotosModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment, true)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'header' && editModal.agistment && (
        <AgistmentHeaderModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'paddocks' && editModal.agistment && (
        <AgistmentPaddocksModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'riding' && editModal.agistment && (
        <AgistmentRidingFacilitiesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'facilities' && editModal.agistment && (
        <AgistmentFacilitiesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'care' && editModal.agistment && (
        <AgistmentCareOptionsModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}

      {editModal?.type === 'services' && editModal.agistment && (
        <AgistmentServicesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
          disableOutsideClick={true}
        />
      )}
    </>
  );
}

export default MyAgistments;
