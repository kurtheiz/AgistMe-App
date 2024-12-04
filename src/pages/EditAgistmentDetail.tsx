import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import { ChevronLeft, Pencil } from 'lucide-react';
import { PageToolbar } from '../components/PageToolbar';
import '../styles/gallery.css';
import { AgistmentPhotos } from '../components/Agistment/AgistmentPhotos';
import { AgistmentHeader } from '../components/Agistment/AgistmentHeader';
import { AgistmentPaddocks } from '../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../components/Agistment/AgistmentCareOptions';
import { AgistmentCareOptionsModal } from '../components/Agistment/AgistmentCareOptionsModal';
import { AgistmentServices } from '../components/Agistment/AgistmentServices';
import { AgistmentServicesModal } from '../components/Agistment/AgistmentServicesModal';
import { usePlanPhotoLimit } from '../stores/reference.store';
import toast from 'react-hot-toast';
import { AgistmentHeaderModal } from '../components/Agistment/AgistmentHeaderModal';
import { AgistmentPaddocksModal } from '../components/Agistment/AgistmentPaddocksModal';
import { AgistmentRidingFacilitiesModal } from '../components/Agistment/AgistmentRidingFacilitiesModal';
import { AgistmentFacilitiesModal } from '../components/Agistment/AgistmentFacilitiesModal';
import { ShareFavoriteButtons } from '../components/shared/ShareFavoriteButtons';

function EditAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<AgistmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isPaddocksModalOpen, setIsPaddocksModalOpen] = useState(false);
  const [isCareOptionsModalOpen, setIsCareOptionsModalOpen] = useState(false);
  const [isRidingFacilitiesModalOpen, setIsRidingFacilitiesModalOpen] = useState(false);
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const maxPhotos = usePlanPhotoLimit(agistment?.listing?.listingType || 'STANDARD');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('Loading agistment with ID:', id);
        console.log('Loading existing agistment from API');
        const data = await agistmentService.getAgistment(id);
        console.log('Loaded agistment data:', data);
        setAgistment(data);
      } catch (err) {
        console.error('Error loading agistment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load agistment');
      } finally {
        setLoading(false);
      }
    };

    loadAgistment();
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleVisibilityToggle = async () => {
    if (!agistment) return;

    try {
      const updatedVisibility = {
        visibility: {
          ...agistment.visibility,
          hidden: !agistment.visibility.hidden
        }
      };
      
      await handleAgistmentUpdate(updatedVisibility);
    } catch (error) {
      console.error('Error updating agistment visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  const handleAgistmentUpdate = async (updatedFields: Partial<AgistmentResponse>) => {
    if (!agistment) return;

    try {
      setIsUpdating(true);
      // Create a new agistment object with updated fields
      const updatedAgistment = {
        ...agistment,
        ...updatedFields
      };
      
      // Update the local state first
      setAgistment(updatedAgistment);

      // Send the update to the server
      const serverUpdatedAgistment = await agistmentService.updateAgistment(agistment.id, updatedAgistment);
      
      // Update local state with server response
      setAgistment(serverUpdatedAgistment);
      
      toast.success('Agistment updated successfully');
      setIsHeaderModalOpen(false);
      setIsPaddocksModalOpen(false);
      setIsCareOptionsModalOpen(false);
      setIsRidingFacilitiesModalOpen(false);
      setIsFacilitiesModalOpen(false);
      setIsServicesModalOpen(false);
    } catch (error) {
      console.error('Error updating agistment:', error);
      toast.error('Failed to update agistment');
      // Revert the local state on error
      setAgistment(agistment);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoGalleryUpdate = async (photos: { link: string; comment?: string }[]) => {
    if (!agistment) return;
    
    const updatedFields: Partial<AgistmentResponse> = {
      photoGallery: {
        ...agistment.photoGallery,
        photos
      }
    };
    
    await handleAgistmentUpdate(updatedFields);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading agistment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 text-lg">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-neutral-900">
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <div
                  onClick={handleBackClick}
                  className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
                <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-neutral-900 dark:text-white whitespace-nowrap sm:max-h-[calc(100vh-16rem)] overflow-x-auto sm:overflow--scroll">
                  {agistment?.propertyLocation?.location && (
                    <>
                      <span>{agistment.propertyLocation.location.state}</span>
                      <span className="text-neutral-900 dark:text-white shrink-0">&gt;</span>
                      <span>{agistment.propertyLocation.location.region}</span>
                      <span className="text-neutral-900 dark:text-white shrink-0">&gt;</span>
                      <span>{agistment.propertyLocation.location.suburb}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Edit/Create Mode Banner */}
      <div className="w-full bg-red-600 dark:bg-red-700 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <h1 className="text-lg font-medium text-white">
                Edit Mode
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleVisibilityToggle}
                disabled={isUpdating}
                title={
                  agistment?.visibility.hidden
                  ? "Hidden - This agistment will not appear in search results"
                  : "Visible - This agistment will appear in search results"
                }
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {agistment?.visibility.hidden ? 'Make Visible' : 'Make Hidden'}
                {isUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-8 p-4">
            {/* Photo Gallery Section */}
            <div className="w-full border-b border-neutral-200 dark:border-neutral-800 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Photos</h3>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {agistment?.photoGallery?.photos?.length || 0} of {maxPhotos} photos
                </span>
              </div>
              <AgistmentPhotos
                agistment={agistment as AgistmentResponse}
                maxPhotos={maxPhotos}
                onPhotosChange={handlePhotoGalleryUpdate}
              />
            </div>

            {/* Header Section */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={() => setIsHeaderModalOpen(true)}
                  className="button-toolbar"
                  title="Edit header information"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <ShareFavoriteButtons 
                  agistmentId={agistment?.id || ''}
                  shareDescription={`Check out this property on AgistMe: ${agistment?.basicInfo?.name || ''}`}
                  hideEdit={true}
                />
              </div>
              <AgistmentHeader
                basicInfo={agistment?.basicInfo}
                propertyLocation={agistment?.propertyLocation}
                contactDetails={agistment?.contact}
                propertyDescription={agistment?.propertyDescription}
              />
            </div>

            {/* Paddocks and Care Options Grid */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Paddocks Section */}
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setIsPaddocksModalOpen(true)}
                      className="button-toolbar"
                      title="Edit paddocks"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Paddock Management
                  </h2>
                  <AgistmentPaddocks
                    paddocks={agistment?.paddocks || {
                      groupPaddocks: {
                        available: 0,
                        comments: '',
                        total: 0,
                        weeklyPrice: 0,
                        totalPaddocks: 0
                      },
                      privatePaddocks: {
                        available: 0,
                        comments: '',
                        total: 0,
                        weeklyPrice: 0,
                        totalPaddocks: 0
                      },
                      sharedPaddocks: {
                        available: 0,
                        comments: '',
                        total: 0,
                        weeklyPrice: 0,
                        totalPaddocks: 0
                      }
                    }}
                    onUpdate={handleAgistmentUpdate}
                    agistmentId={agistment?.id || ''}
                  />
                </div>

                {/* Care Options Section */}
                <div className="lg:border-l lg:border-neutral-200 lg:dark:border-neutral-800 lg:pl-8">
                  <div className="mb-4">
                    <button
                      onClick={() => setIsCareOptionsModalOpen(true)}
                      className="button-toolbar"
                      title="Edit care options"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Care Options
                  </h2>
                  <AgistmentCareOptions
                    care={agistment?.care}
                  />
                </div>
              </div>
            </div>

            {/* Riding Facilities and Property Facilities Grid */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Riding Facilities Section */}
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setIsRidingFacilitiesModalOpen(true)}
                      className="button-toolbar"
                      title="Edit riding facilities"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Riding Facilities
                  </h2>
                  <AgistmentRidingFacilities
                    ridingFacilities={agistment?.ridingFacilities || { arenas: [], roundYards: [] }}
                  />
                </div>

                {/* Property Facilities Section */}
                <div className="lg:border-l lg:border-neutral-200 lg:dark:border-neutral-800 lg:pl-8">
                  <div className="mb-4">
                    <button
                      onClick={() => setIsFacilitiesModalOpen(true)}
                      className="button-toolbar"
                      title="Edit facilities"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Property Facilities
                  </h2>
                  <AgistmentFacilities
                    facilities={agistment?.facilities || {
                      feedRoom: { available: false, comments: '' },
                      floatParking: { available: false, comments: '', monthlyPrice: 0 },
                      hotWash: { available: false, comments: '' },
                      tackRoom: { available: false, comments: '' },
                      tieUp: { available: false, comments: '' },
                      stables: { available: false, comments: '', quantity: 0 }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setIsServicesModalOpen(true)}
                  className="button-toolbar"
                  title="Edit services"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                Services
              </h2>
              <AgistmentServices
                services={agistment?.propertyServices?.services || []}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgistmentServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        services={agistment?.propertyServices?.services || []}
        agistmentId={agistment?.id || ''}
        onUpdate={handleAgistmentUpdate}
      />
      <AgistmentHeaderModal
        basicInfo={agistment?.basicInfo}
        propertyLocation={agistment?.propertyLocation}
        contactDetails={agistment?.contact}
        propertyDescription={agistment?.propertyDescription}
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
      />
      <AgistmentPaddocksModal
        agistmentId={agistment?.id || ''}
        paddocks={agistment?.paddocks || {
          privatePaddocks: {
            available: 0,
            comments: '',
            total: 0,
            weeklyPrice: 0,
            totalPaddocks: 0
          },
          sharedPaddocks: {
            available: 0,
            comments: '',
            total: 0,
            weeklyPrice: 0,
            totalPaddocks: 0
          },
          groupPaddocks: {
            available: 0,
            comments: '',
            total: 0,
            weeklyPrice: 0,
            totalPaddocks: 0
          }
        }}
        isOpen={isPaddocksModalOpen}
        onClose={() => setIsPaddocksModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
      />
      <AgistmentCareOptionsModal
        care={agistment?.care || {
          fullCare: { available: false, comments: '', monthlyPrice: 0 },
          partCare: { available: false, comments: '', monthlyPrice: 0 },
          selfCare: { available: false, comments: '', monthlyPrice: 0 }
        }}
        onUpdate={handleAgistmentUpdate}
        isOpen={isCareOptionsModalOpen}
        onClose={() => setIsCareOptionsModalOpen(false)}
      />
      <AgistmentRidingFacilitiesModal
        agistmentId={agistment?.id || ''}
        ridingFacilities={agistment?.ridingFacilities || { arenas: [], roundYards: [] }}
        isOpen={isRidingFacilitiesModalOpen}
        onClose={() => setIsRidingFacilitiesModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
      />
      <AgistmentFacilitiesModal
        agistmentId={agistment?.id || ''}
        facilities={agistment?.facilities || {
          feedRoom: { available: false, comments: '' },
          floatParking: { available: false, comments: '', monthlyPrice: 0 },
          hotWash: { available: false, comments: '' },
          tackRoom: { available: false, comments: '' },
          tieUp: { available: false, comments: '' },
          stables: { available: false, comments: '', quantity: 0 }
        }}
        isOpen={isFacilitiesModalOpen}
        onClose={() => setIsFacilitiesModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
      />
    </div>
  );
}

export default EditAgistmentDetail;
