import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { agistmentService } from '../../services/agistment.service';
import { PageToolbar } from '../../components/PageToolbar';
import { AgistmentSearchResponse } from '../../types/search';
import { AgistmentResponse } from '../../types/agistment';
import { AgistmentHeaderModal } from '../../components/Agistment/AgistmentHeaderModal';
import { AgistmentPaddocksModal } from '../../components/Agistment/AgistmentPaddocksModal';
import { AgistmentRidingFacilitiesModal } from '../../components/Agistment/AgistmentRidingFacilitiesModal';
import { AgistmentFacilitiesModal } from '../../components/Agistment/AgistmentFacilitiesModal';
import { AgistmentCareOptionsModal } from '../../components/Agistment/AgistmentCareOptionsModal';
import { AgistmentServicesModal } from '../../components/Agistment/AgistmentServicesModal';
import { AgistmentPhotosModal } from '../../components/Agistment/AgistmentPhotosModal';
import { AgistmentFromTextModal } from '../../components/Agistment/AgistmentFromTextModal';
import toast from 'react-hot-toast';

type EditModalType = 'fromtext' | 'header' | 'paddocks' | 'riding' | 'facilities' | 'care' | 'services' | 'photos' | null;

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ type: EditModalType; agistment: AgistmentResponse } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(response.results || []);

        // Automatically show help dialog if first agistment is new and coming from listagistment
        const fromListAgistment = location.state?.from === '/listagistment';
        if (fromListAgistment && response.results?.[0]?.basicInfo?.name === 'New Agistment') {
          setIsHelpOpen(true);
        }
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
  }, [userId, location.state]);

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

      toast.success('Subscription cancelled successfully');

      // Only close modal if keepModalOpen is false
      if (!keepModalOpen) {
        setEditModal(null);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityToggle = async (agistmentId: string, currentStatus: string) => {
    // Only validate when publishing (changing from HIDDEN to PUBLISHED)
    if (currentStatus === 'HIDDEN') {
      const agistment = agistments.find(a => a.id === agistmentId);
      if (!agistment) return;

      // Check if there are any validation errors
      const hasBasicInfoErrors = !agistment.basicInfo?.name ||
        agistment.basicInfo.name.length < 3 ||
        agistment.basicInfo.name === 'New Agistment' ||
        !agistment.propertyLocation?.location?.suburb ||
        !agistment.propertyLocation?.location?.state ||
        !agistment.propertyLocation?.location?.region ||
        !agistment.propertyLocation?.location?.postcode;

      const hasPaddocksErrors = !(agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 ||
        agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 ||
        agistment.paddocks?.groupPaddocks?.totalPaddocks > 0);

      const hasCareErrors = !(agistment.care?.selfCare?.available ||
        agistment.care?.partCare?.available ||
        agistment.care?.fullCare?.available);

      const hasPhotosErrors = !agistment.photoGallery?.photos || agistment.photoGallery.photos.length === 0;

      if (hasBasicInfoErrors || hasPaddocksErrors || hasCareErrors || hasPhotosErrors) {
        setIsHelpOpen(true);
        return;
      }
    }

    await handleUpdateAgistment(agistmentId, {
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
      <div className="text-center text-sm text-neutral-600 pt-4 flex items-center justify-center gap-2">
        Edit Help
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsHelpOpen(true);
          }}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          onClick={() => setEditModal({ type: 'fromtext', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          <Sparkles className={'w-4 h-4'} />
          <span>From Text</span>
          
        </button>
        <button
          onClick={() => setEditModal({ type: 'header', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
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
          className="button-toolbar"
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
          className="button-toolbar"
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
          className="button-toolbar"
        >
          Photos
          {!checkSectionValidation(agistment, 'photos') && (
            <div className="absolute -top-1 -right-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </button>
        <button
          onClick={() => setEditModal({ type: 'services', agistment: agistment as AgistmentResponse })}
          className="button-toolbar"
        >
          Services
        </button>
      </div>

      <div className={`text-sm font-medium text-center py-1.5 ${agistment.status === 'PUBLISHED'
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
                  onClick={() => navigate('/dashboard')}
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
        ) : agistments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <p className="text-lg font-medium text-gray-900 mb-2">No agistments yet</p>
            <p className="text-sm text-gray-600 text-center mb-6">Start earning by listing your property for horse agistment</p>
            <button
              onClick={() => navigate('/listagistment')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              List your property
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!isLoading && agistments.length > 0 && (
              <div className="mb-4 text-sm text-neutral-600">
                {agistments.length} {agistments.length === 1 ? 'agistment' : 'agistments'}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {agistments.map((agistment) => (
                <div key={agistment.id} className="bg-white rounded-lg shadow">
                  <div className="p-4 bg-primary-500">
                    <h3 className="text-lg font-medium text-white">
                      {agistment.basicInfo?.name || 'Unnamed Agistment'}
                    </h3>
                  </div>
                  {renderEditButtons(agistment)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editModal?.type === 'fromtext' && editModal.agistment && (
        <AgistmentFromTextModal
          agistment={editModal.agistment}
          isOpen={true}
          onClose={() => setEditModal(null)}
          onUpdate={(updatedAgistment) => handleUpdateAgistment(editModal.agistment.id, updatedAgistment, true)}
          disableOutsideClick={true}
        />
      )}

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
      <Transition appear show={isHelpOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsHelpOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Agistment Section Guide
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-1">Edit Help</p>
                      <p className="text-sm text-neutral-600">
                        Sections marked with a <span className="inline-block align-middle"><AlertCircle className="w-4 h-4 text-red-500" /></span> require your attention before your agistment can be made visible in search results.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">From Text</p>
                      <div className="text-sm space-y-3">

                        <p className="text-neutral-600">Typically used to start your listing from a plain english description, like a social media post.</p>
                      </div>

                      <p className="font-medium">Section Requirements:</p>
                      <div className="text-sm space-y-3">
                        <div>
                          <p className="font-medium text-neutral-800">Basic Info</p>
                          <p className="text-neutral-600">Set your agistment name and complete location details</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Paddocks</p>
                          <p className="text-neutral-600">Add at least one paddock type (private, shared, or group)</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Riding Facilities</p>
                          <p className="text-neutral-600">Optional: Add any available riding facilities</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Facilities</p>
                          <p className="text-neutral-600">Optional: Add any additional facilities</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Care</p>
                          <p className="text-neutral-600">Enable at least one care option (self, part, or full care)</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Photos</p>
                          <p className="text-neutral-600">Upload at least one photo of your property</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">Services</p>
                          <p className="text-neutral-600">Optional: Additional services you offer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      onClick={() => setIsHelpOpen(false)}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default MyAgistments;
