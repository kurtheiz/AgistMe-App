import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Eye, X, Check, Trash2} from 'lucide-react';
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
//import { AgistmentPhotos } from '../../components/Agistment/AgistmentPhotos';
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

  const handleUpdateAgistment = async (agistmentId: string, updatedData: Partial<AgistmentResponse>) => {
    if (!agistmentId || isUpdating) return;

    setIsUpdating(true);
    try {
      // Get the current agistment
      const currentAgistment = agistments.find(a => a.id === agistmentId);
      if (!currentAgistment) {
        throw new Error('Agistment not found');
      }

      // Merge the updates with current data
      const mergedAgistment = {
        ...currentAgistment,
        ...updatedData
      };

      // Send the complete updated agistment
      await agistmentService.updateAgistment(agistmentId, mergedAgistment);
      
      // Refresh the list
      const updatedAgistments = await agistmentService.getMyAgistments();
      setAgistments(updatedAgistments.results || []);
      
      toast.success('Agistment updated successfully');
      
      // Close any open modals
      setEditModal(null);
    } catch (error) {
      console.error('Error updating agistment:', error);
      toast.error('Failed to update agistment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityToggle = async (agistmentId: string, currentStatus: string) => {
    handleUpdateAgistment(agistmentId, {
      status: currentStatus === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
    });
  };

  const handleModalClose = () => {
    setEditModal(null);
  };

  const handleModalSave = async (updatedData: any) => {
    if (!editModal) return;

    handleUpdateAgistment(editModal.agistment.id, updatedData);
  };

  const handlePreview = (agistment: any) => {
    navigate(`/dashboard/agistments/${agistment.id}`);
  };

  const renderEditButtons = (agistment: AgistmentSearchResponse) => (
    <div className="bg-neutral-50 border-t border-neutral-200">
      <div className="text-center text-sm text-neutral-600 pt-4">Edit sections</div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          onClick={() => setEditModal({ type: 'header', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Basic Info
        </button>
        <button
          onClick={() => setEditModal({ type: 'paddocks', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Paddocks
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
          className="button-toolbar"
        >
          Care
        </button>
        <button
          onClick={() => setEditModal({ type: 'photos', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Photos
        </button>
      </div>

      <div className="border-t border-neutral-200 p-4 flex gap-2 bg-white">
        <button
          onClick={() => handlePreview(agistment)}
          className="button-toolbar"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => handleVisibilityToggle(agistment.id, agistment.status)}
          className="button-toolbar"
        >
          {agistment.status === 'PUBLISHED' ? (
            <>
              <X className="w-4 h-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Publish</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setAgistmentToDelete(agistment.id)}
          className="button-toolbar text-red-600 ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
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
        title="Delete Agistment"
        message="Are you sure you want to delete this agistment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* {editModal?.type === 'photos' && (
        <AgistmentPhotos
          isOpen={true}
          onClose={handleModalClose}
          onSave={handleModalSave}
          agistment={editModal.agistment}
        />
      )} */}

      {editModal?.type === 'header' && (
        <AgistmentHeaderModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}

      {editModal?.type === 'paddocks' && (
        <AgistmentPaddocksModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}

      {editModal?.type === 'riding' && (
        <AgistmentRidingFacilitiesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}

      {editModal?.type === 'facilities' && (
        <AgistmentFacilitiesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}

      {editModal?.type === 'care' && (
        <AgistmentCareOptionsModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}

      {editModal?.type === 'services' && (
        <AgistmentServicesModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment)}
        />
      )}
    </>
  );
}

export default MyAgistments;
