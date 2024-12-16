import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Eye, X, Check, Trash2, Search } from 'lucide-react';
import { agistmentService } from '../../services/agistment.service';
import { PageToolbar } from '../../components/PageToolbar';
import { AgistmentSearchResponse, AgistmentResponse } from '../../types/search';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { AgistmentHeaderModal } from '../../components/Agistment/AgistmentHeaderModal';
import { AgistmentPaddocksModal } from '../../components/Agistment/AgistmentPaddocksModal';
import { AgistmentRidingFacilitiesModal } from '../../components/Agistment/AgistmentRidingFacilitiesModal';
import { AgistmentFacilitiesModal } from '../../components/Agistment/AgistmentFacilitiesModal';
import { AgistmentCareOptionsModal } from '../../components/Agistment/AgistmentCareOptionsModal';
import { AgistmentServicesModal } from '../../components/Agistment/AgistmentServicesModal';
import { AgistmentPhotos } from '../../components/Agistment/AgistmentPhotos';
import toast from 'react-hot-toast';

type EditModalType = 'header' | 'paddocks' | 'riding' | 'facilities' | 'care' | 'services' | 'photos' | null;

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agistmentToDelete, setAgistmentToDelete] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ type: EditModalType; agistment: AgistmentResponse } | null>(null);
  const [selectedAgistment, setSelectedAgistment] = useState<AgistmentSearchResponse | null>(null);
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
    <div className="mt-4">
      <div className="text-sm text-gray-500 mb-2">Edit sections:</div>
      <div className="flex flex-wrap gap-2" role="group">
        <button
          onClick={() => setEditModal({ type: 'header', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Basic Info
        </button>
        <button
          onClick={() => setEditModal({ type: 'photos', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Photos
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
          Riding
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
          onClick={() => setEditModal({ type: 'services', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Services
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
            
            <div className="space-y-4">
              {agistments.map((agistment) => (
                <div key={agistment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                      <div className={`w-full h-full ${agistment.status === 'HIDDEN' ? 'blur-sm' : ''}`}>
                        {agistment.photoGallery?.photos?.[0] ? (
                          <img
                            src={agistment.photoGallery.photos[0].link}
                            alt={agistment.basicInfo?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No photo</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold px-4 py-2 rounded-full ${
                          agistment.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {agistment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-grow p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{agistment.basicInfo?.name}</h3>
                          <p className="text-gray-600">
                            {agistment.propertyLocation?.location?.suburb}, {agistment.propertyLocation?.location?.state}
                          </p>
                        </div>
                      </div>
                      
                      {renderEditButtons(agistment)}
                      
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <button
                          onClick={() => handlePreview(agistment)}
                          className="button-toolbar"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleVisibilityToggle(agistment.id, agistment.status === 'PUBLISHED')}
                          className="button-toolbar"
                          title={agistment.status === 'PUBLISHED' ? "Hide" : "Show"}
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
                          className="button-toolbar text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
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

      {editModal?.type === 'photos' && (
        <AgistmentPhotos
          isOpen={true}
          onClose={handleModalClose}
          onSave={handleModalSave}
          agistment={editModal.agistment}
        />
      )}

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
