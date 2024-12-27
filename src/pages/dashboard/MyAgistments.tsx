import { useEffect, useState, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, AlertCircle, HelpCircle, Sparkles, ChevronDown } from 'lucide-react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
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
import { formatPrice } from '../../utils/prices';
import { formatDate } from '../../utils/dates';
import toast from 'react-hot-toast';

type EditModalType = 'fromtext' | 'header' | 'paddocks' | 'riding' | 'facilities' | 'care' | 'services' | 'photos' | null;

interface SubscriptionData {
  id: string;
  customer: string;
  status: string;
  current_period_end_date: string;
  current_period_start_date: string;
  metadata: {
    'Agistment Listing': string;
    listing_type: 'ListingType.STANDARD' | 'ListingType.PREMIUM';
  };
  trial_end_date: string;
  default_payment_method: string;
  price_amount: number;
  price_currency: string;
  latest_invoice: string;
  days_until_billing: number;
  billing_starts: string;
}

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ type: EditModalType; agistment: AgistmentResponse } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [flashErrorsId, setFlashErrorsId] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{[key: string]: SubscriptionData}>({});
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<{[key: string]: boolean}>({});

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

      toast.success('Agistment updated successfully');

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
        setFlashErrorsId(agistmentId);
        setTimeout(() => setFlashErrorsId(null), 1000);
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
    <div className="bg-white border-t border-neutral-200">
      <div className="text-m font-medium text-neutral-800 pt-4 pb-2 text-center flex items-center justify-center gap-2">
        Click on a section below to edit
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsHelpOpen(true);
          }}
          className="text-neutral-600 hover:text-neutral-800"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          onClick={() => setEditModal({ type: 'fromtext', agistment: agistment as AgistmentResponse })}
          className="button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100"
        >
          <Sparkles className={'w-4 h-4'} />
          <span>From Text</span>
        </button>
        <button
          onClick={() => setEditModal({ type: 'header', agistment: agistment as AgistmentResponse })}
          className={`button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 ${flashErrorsId === agistment.id && !checkSectionValidation(agistment, 'header') ? 'animate-flash' : ''}`}
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
          className={`button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 ${flashErrorsId === agistment.id && !checkSectionValidation(agistment, 'paddocks') ? 'animate-flash' : ''}`}
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
          className="button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100"
        >
          Riding Facilities
        </button>
        <button
          onClick={() => setEditModal({ type: 'facilities', agistment: agistment as AgistmentResponse })}
          className="button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100"
        >
          Facilities
        </button>
        <button
          onClick={() => setEditModal({ type: 'care', agistment: agistment as AgistmentResponse })}
          className={`button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 ${flashErrorsId === agistment.id && !checkSectionValidation(agistment, 'care') ? 'animate-flash' : ''}`}
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
          className={`button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 ${flashErrorsId === agistment.id && !checkSectionValidation(agistment, 'photos') ? 'animate-flash' : ''}`}
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
          className="button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100"
        >
          Services
        </button>
      </div>

      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button 
              className="flex w-full justify-between items-center px-4 py-3 text-neutral-700 hover:bg-neutral-50 border-t border-neutral-200 bg-white"
              onClick={async () => {
                if (!open && !subscriptionData[agistment.id]) {
                  setLoadingSubscriptions(prev => ({ ...prev, [agistment.id]: true }));
                  try {
                    const data = await agistmentService.getSubscription(agistment.id);
                    setSubscriptionData(prev => ({ ...prev, [agistment.id]: data }));
                  } catch (error) {
                    console.error('Failed to load subscription data:', error);
                    toast.error('Failed to load subscription data');
                  } finally {
                    setLoadingSubscriptions(prev => ({ ...prev, [agistment.id]: false }));
                  }
                }
              }}
            >
              <div className="flex items-center">
                <span className="text-lg font-medium">Billing</span>
              </div>
              <ChevronDown className={`${open ? 'transform rotate-180' : ''} w-4 h-4 text-neutral-500`} />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 py-3 text-sm text-neutral-600 bg-white border-t border-neutral-200">
              {loadingSubscriptions[agistment.id] ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-neutral-600"></div>
                </div>
              ) : subscriptionData[agistment.id] ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscriptionData[agistment.id]?.status === 'trialing' 
                        ? 'bg-blue-100 text-blue-700'
                        : subscriptionData[agistment.id]?.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {subscriptionData[agistment.id]?.status.charAt(0).toUpperCase() + 
                       subscriptionData[agistment.id]?.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">
                      {(subscriptionData[agistment.id]?.metadata?.listing_type || 'ListingType.STANDARD').replace('ListingType.', '')} (
                      {formatPrice(subscriptionData[agistment.id]?.price_amount || 0)}{' '}
                      {subscriptionData[agistment.id]?.price_currency || 'AUD'}/month)
                    </span>
                  </div>
                  {subscriptionData[agistment.id]?.status === 'trialing' && (
                    <>
                      <div className="flex justify-between">
                        <span>Trial Ends:</span>
                        <span className="font-medium">
                          {formatDate(subscriptionData[agistment.id]?.trial_end_date || '')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billing Starts:</span>
                        <span className="font-medium">
                          {formatDate(subscriptionData[agistment.id]?.billing_starts || '')} (
                          {subscriptionData[agistment.id]?.days_until_billing || 0} days)
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Current Period:</span>
                    <span className="font-medium">
                      {formatDate(subscriptionData[agistment.id]?.current_period_start_date || '')} - {' '}
                      {formatDate(subscriptionData[agistment.id]?.current_period_end_date || '')}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500">Failed to load subscription information.</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Subscription
                </button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
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
          <div className="pb-8 pt-4 md:px-4">
            {!isLoading && agistments.length > 0 && (
              <div className="mb-4 text-sm text-neutral-600 px-4">
                {agistments.length} {agistments.length === 1 ? 'agistment' : 'agistments'} listed
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {agistments.map((agistment) => (
                <div key={agistment.id} className="bg-white rounded-none sm:rounded-lg shadow-lg">
                  <div className="p-4 bg-primary-500 rounded-none sm:rounded-t-lg">
                    <h3 className="text-lg font-medium text-white">
                      {agistment.basicInfo?.name || 'Unnamed Agistment'}
                    </h3>
                    <p className="text-sm text-white/80 mt-1">
                      {agistment.propertyLocation?.location?.suburb && agistment.propertyLocation?.location?.state
                        ? `${agistment.propertyLocation.location.suburb}, ${agistment.propertyLocation.location.state}`
                        : 'No address yet'}
                    </p>
                    <div className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-2 ${
                      agistment.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {agistment.status === 'PUBLISHED' ? 'Available in search results' : 'Hidden from search results'}
                    </div>
                  </div>

                  {/* Analytics Summary */}
                  <div className="px-4 py-3 border-b border-neutral-200 bg-white text-center">
                    <div className="text-m font-medium text-neutral-800 mb-2">Analytics for the Past 30 Days</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <div className="text-xl font-semibold text-emerald-700">{agistment.analyticsSummary?.totalViewCount || 0}</div>
                        <div className="text-xs text-emerald-700">Views</div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <div className="text-xl font-semibold text-emerald-700">{agistment.analyticsSummary?.totalFavouritedCount || 0}</div>
                        <div className="text-xs text-emerald-700">Favourites</div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <div className="text-xl font-semibold text-emerald-700">{agistment.analyticsSummary?.totalEnquiriesCount || 0}</div>
                        <div className="text-xs text-emerald-700">Enquiries</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between px-4 py-3 border-b border-neutral-200 bg-white">
                    <button
                      onClick={() => handlePreview(agistment)}
                      className="button-toolbar bg-neutral-50 border border-neutral-200 hover:bg-neutral-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleVisibilityToggle(agistment.id, agistment.status)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {agistment.status === 'PUBLISHED' ? 'Hide' : 'Unhide'}
                    </button>
                  </div>

                  <div className="bg-white">
                    {renderEditButtons(agistment)}
                  </div>
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
                      <p className="text-sm text-neutral-600">
                        <i>Sections marked with a <span className="inline-block align-middle"><AlertCircle className="w-4 h-4 text-red-500" /></span> require your attention before your agistment can be made visible in search results.</i>
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
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
