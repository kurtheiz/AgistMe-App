import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { ArrowLeftIcon } from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import '../styles/gallery.css';
import { AgistmentPhotos } from '../components/Agistment/AgistmentPhotos';
import { AgistmentHeader } from '../components/Agistment/AgistmentHeader';
import { AgistmentPaddocks } from '../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../components/Agistment/AgistmentCareOptions';
import { AgistmentServices } from '../components/Agistment/AgistmentServices';
import { usePlanPhotoLimit } from '../stores/reference.store';
import toast from 'react-hot-toast';
import { AgistmentHeaderModal } from '../components/Agistment/AgistmentHeaderModal';
import { Pencil } from 'lucide-react';
import { AgistmentPaddocksModal } from '../components/Agistment/AgistmentPaddocksModal';
import { AgistmentCareOptionsModal } from '../components/Agistment/AgistmentCareOptionsModal';
import { AgistmentRidingFacilitiesModal } from '../components/Agistment/AgistmentRidingFacilitiesModal';

function EditAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isPaddocksModalOpen, setIsPaddocksModalOpen] = useState(false);
  const [isCareOptionsModalOpen, setIsCareOptionsModalOpen] = useState(false);
  const [isRidingFacilitiesModalOpen, setIsRidingFacilitiesModalOpen] = useState(false);
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

    setIsUpdating(true);
    try {
      const updatedAgistment = await agistmentService.updateAgistment(agistment.id, {
        visibility: { hidden: !agistment.visibility.hidden }
      });
      setAgistment(updatedAgistment);
      toast.success(`Agistment is now ${updatedAgistment.visibility.hidden ? 'hidden' : 'visible'}`);
    } catch (error) {
      console.error('Error updating agistment visibility:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAgistmentUpdate = async (updatedFields: Partial<Agistment>) => {
    if (!agistment) return;

    try {
      setIsUpdating(true);
      // Create a new agistment object with updated fields
      const updatedAgistment: Agistment = {
        ...agistment,
        basicInfo: updatedFields.basicInfo || agistment.basicInfo,
        propertyLocation: updatedFields.propertyLocation || agistment.propertyLocation,
        contact: updatedFields.contact || agistment.contact,
        paddocks: updatedFields.paddocks || agistment.paddocks,
        propertyDescription: updatedFields.propertyDescription || agistment.propertyDescription,
        photoGallery: updatedFields.photoGallery || agistment.photoGallery,
        propertyServices: updatedFields.propertyServices || agistment.propertyServices,
        ridingFacilities: updatedFields.ridingFacilities || agistment.ridingFacilities,
        facilities: updatedFields.facilities || agistment.facilities,
        care: updatedFields.care || agistment.care,
        visibility: updatedFields.visibility || agistment.visibility,
        listing: updatedFields.listing || agistment.listing,
        socialMedia: updatedFields.socialMedia || agistment.socialMedia,
        urgentAvailability: updatedFields.urgentAvailability ?? agistment.urgentAvailability,
        paddockTypes: updatedFields.paddockTypes || agistment.paddockTypes,
        status: updatedFields.status || agistment.status
      };
      
      // Update the local state first
      setAgistment(updatedAgistment);

      // Send the FULL updated agistment to the server
      const serverUpdatedAgistment = await agistmentService.updateAgistment(agistment.id, updatedAgistment);
      
      // Update local state with server response
      setAgistment(serverUpdatedAgistment);
      
      toast.success('Agistment updated successfully');
      setIsHeaderModalOpen(false);
      setIsPaddocksModalOpen(false);
      setIsCareOptionsModalOpen(false);
      setIsRidingFacilitiesModalOpen(false);
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
    
    const updatedFields: Partial<Agistment> = {
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
                  <ArrowLeftIcon className="w-3 h-3" />
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
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-colors
                  flex items-center justify-center gap-2
                  ${agistment?.visibility.hidden 
                    ? 'text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                    : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${agistment?.visibility.hidden 
                    ? 'focus:ring-red-500' 
                    : 'focus:ring-green-500'
                  }
                `}
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
                agistment={agistment || {
                  id: '',
                  status: 'DRAFT',
                  basicInfo: { name: '', propertySize: 0 },
                  photoGallery: { photos: [] },
                  propertyLocation: { location: { address: '', suburb: '', state: '', postcode: '', region: '' } },
                  contact: { contactDetails: { name: '', email: '', number: '' } },
                  propertyDescription: { description: '' },
                  facilities: {
                    feedRoom: { available: false, comments: '' },
                    floatParking: { available: false, comments: '', monthlyPrice: 0 },
                    hotWash: { available: false, comments: '' },
                    tackRoom: { available: false, comments: '' },
                    tieUp: { available: false, comments: '' },
                    stables: { available: false, comments: '', quantity: 0 }
                  },
                  visibility: { hidden: true },
                  ridingFacilities: { arenas: [], roundYards: [] },
                  paddocks: {
                    groupPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
                    privatePaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
                    sharedPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 }
                  },
                  propertyServices: { services: [] },
                  care: {
                    fullCare: { available: false, comments: '', monthlyPrice: 0 },
                    partCare: { available: false, comments: '', monthlyPrice: 0 },
                    selfCare: { available: false, comments: '', monthlyPrice: 0 }
                  },
                  socialMedia: [],
                  urgentAvailability: false,
                  paddockTypes: [],
                  listing: { listingType: 'STANDARD' }
                }}
                maxPhotos={maxPhotos}
                onPhotosChange={handlePhotoGalleryUpdate}
                isEditable={true}
              />
            </div>

            {/* Header Section */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
              <div className="mb-4">
                <button
                  onClick={() => setIsHeaderModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                Header
              </h2>
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
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Paddock Management
                  </h2>
                  <AgistmentPaddocks
                    paddocks={agistment?.paddocks || {
                      groupPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
                      privatePaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
                      sharedPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 }
                    }}
                    onUpdate={handleAgistmentUpdate}
                    isEditable={true}
                    agistmentId={agistment?.id || ''}
                  />
                </div>

                {/* Care Options Section */}
                <div className="lg:border-l lg:border-neutral-200 lg:dark:border-neutral-800 lg:pl-8">
                  <div className="mb-4">
                    <button
                      onClick={() => setIsCareOptionsModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                    Care Options
                  </h2>
                  <AgistmentCareOptions
                    care={agistment?.care || {
                      fullCare: { available: false, comments: '', monthlyPrice: 0 },
                      partCare: { available: false, comments: '', monthlyPrice: 0 },
                      selfCare: { available: false, comments: '', monthlyPrice: 0 }
                    }}
                    isEditable={true}
                    onUpdate={handleAgistmentUpdate}
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
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
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
                      onClick={() => {}}
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
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
                    isEditable={true}
                    onUpdate={handleAgistmentUpdate}
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                Services
              </h2>
              <AgistmentServices
                services={agistment?.propertyServices?.services || []}
                isEditable={true}
                onUpdate={handleAgistmentUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgistmentHeaderModal
        basicInfo={agistment?.basicInfo}
        propertyLocation={agistment?.propertyLocation}
        contactDetails={agistment?.contact}
        propertyDescription={agistment?.propertyDescription}
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        onUpdate={(updatedAgistment: Partial<Agistment>) => {
          handleAgistmentUpdate(updatedAgistment);
        }}
      />
      <AgistmentPaddocksModal
        isOpen={isPaddocksModalOpen}
        onClose={() => setIsPaddocksModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
        agistmentId={agistment?.id || ''}
        paddocks={agistment?.paddocks || {
          groupPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
          privatePaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 },
          sharedPaddocks: { available: 0, comments: '', total: 0, weeklyPrice: 0, totalPaddocks: 0 }
        }}
      />
      <AgistmentCareOptionsModal
        isOpen={isCareOptionsModalOpen}
        onClose={() => setIsCareOptionsModalOpen(false)}
        care={agistment?.care}
        onUpdate={handleAgistmentUpdate}
      />
      <AgistmentRidingFacilitiesModal
        agistmentId={agistment?.id || ''}
        ridingFacilities={agistment?.ridingFacilities || { arenas: [], roundYards: [] }}
        isOpen={isRidingFacilitiesModalOpen}
        onClose={() => setIsRidingFacilitiesModalOpen(false)}
        onUpdate={handleAgistmentUpdate}
      />
    </div>
  );
}

export default EditAgistmentDetail;
