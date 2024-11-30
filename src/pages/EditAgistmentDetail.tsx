import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { ArrowLeftIcon } from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import '../styles/gallery.css';
import { AgistmentPhotos } from '../components/Agistment/AgistmentPhotos';
import { AgistmentHeader } from '../components/Agistment/AgistmentHeader';
import { AgistmentDescription } from '../components/Agistment/AgistmentDescription';
import { AgistmentPaddocks } from '../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../components/Agistment/AgistmentCareOptions';
import { AgistmentServices } from '../components/Agistment/AgistmentServices';
import { usePlanPhotoLimit } from '../stores/reference.store';
import toast from 'react-hot-toast';
import { ShareFavoriteButtons } from '../components/shared/ShareFavoriteButtons';

// Use the same key as in Agistments.tsx

function EditAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const maxPhotos = usePlanPhotoLimit(agistment?.listing?.listingType || 'STANDARD');
  console.log('Max photos:', maxPhotos);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !agistment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white mb-4">
          {error || 'Agistment not found'}
        </h1>
        <button
          onClick={() => navigate('/agistments')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Agistments
        </button>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleVisibilityToggle = async () => {
    if (!agistment) return;

    setIsUpdating(true);
    try {
      // Toggle the hidden status
      const updatedAgistment = await agistmentService.updateAgistment(agistment.id, {
        visibility: { hidden: !agistment.visibility.hidden }
      });

      // Update local state
      setAgistment(updatedAgistment);
      toast.success(`Agistment is now ${updatedAgistment.visibility.hidden ? 'hidden' : 'visible'}`);
    } catch (error) {
      console.error('Error updating agistment visibility:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-neutral-900">
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white"
                >
                  <ArrowLeftIcon className="w-3 h-3" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
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
                  agistment.visibility.hidden
                  ? "Hidden - This agistment will not appear in search results"
                  : "Visible - This agistment will appear in search results"
                }
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-colors
                  flex items-center justify-center gap-2
                  ${agistment.visibility.hidden 
                    ? 'text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                    : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${agistment.visibility.hidden 
                    ? 'focus:ring-red-500' 
                    : 'focus:ring-green-500'
                  }
                `}
              >
                {agistment.visibility.hidden ? 'Make Visible' : 'Make Hidden'}
                {isUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Photo Gallery and Location Details Section */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Photo Gallery - 66% width on desktop */}
              <div className="w-full lg:w-2/3 px-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Photos</h3>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {agistment?.photoGallery?.photos?.length || 0} of {maxPhotos} photos
                  </span>
                </div>
                <AgistmentPhotos
                  agistment={agistment}
                  maxPhotos={maxPhotos}
                  onPhotosChange={(photos) => {
                    setAgistment(prev => prev ? {
                      ...prev,
                      photoGallery: { photos }
                    } : null);
                  }}
                />
              </div>

              {/* Location and Contact Details - 33% width on desktop */}
              <div className="w-full lg:w-1/3 p-4">
                {/* Share and Favorite Buttons */}
                <div className="mb-6">
                  <ShareFavoriteButtons
                    agistmentId={agistment.id}
                    shareDescription={`Check out this property on AgistMe: ${agistment.basicInfo.name} in ${agistment.propertyLocation.location.suburb}, ${agistment.propertyLocation.location.region}, ${agistment.propertyLocation.location.state}`}
                  />
                </div>

                <AgistmentHeader
                  agistmentId={agistment.id}
                  basicInfo={agistment.basicInfo}
                  location={agistment.propertyLocation.location}
                  contactDetails={agistment.contact}
                  isEditable={true}
                  showEnquireButton={false}
                  onUpdate={(updatedAgistment) => {
                    setAgistment(prev => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        basicInfo: updatedAgistment.basicInfo || prev.basicInfo,
                        propertyLocation: {
                          location: updatedAgistment.location || prev.propertyLocation.location
                        },
                        contact: updatedAgistment.contact || prev.contact
                      };
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-4">
          {/* Description Section */}
          <div className="space-y-4 p-4">
            <AgistmentDescription
              agistmentId={agistment.id}
              description={agistment.propertyDescription.description}
              isEditable={true}
              onUpdate={(updatedAgistment) => {
                setAgistment(prev => prev ? {
                  ...prev,
                  ...updatedAgistment
                } : null);
              }}
            />

            {/* Paddocks */}
            <AgistmentPaddocks
              agistmentId={agistment.id}
              paddocks={agistment.paddocks}
              isEditable={true}
              onUpdate={(updatedAgistment) => {
                setAgistment(prev => prev ? {
                  ...prev,
                  ...updatedAgistment
                } : null);
              }}
            />

            {/* Riding Facilities */}
            <AgistmentRidingFacilities
              ridingFacilities={agistment.ridingFacilities}
              isEditable={true}
            />

            {/* Facilities */}
            <AgistmentFacilities
              agistmentId={agistment.id}
              facilities={agistment.facilities}
              isEditable={true}
              onUpdate={(updatedAgistment) => {
                setAgistment(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    facilities: updatedAgistment.facilities || prev.facilities
                  };
                });
              }}
            />

            {/* Care Options */}
            <AgistmentCareOptions
              care={agistment.care}
              isEditable={true}
            />

            {/* Services */}
            <AgistmentServices
              services={agistment.propertyServices.services}
              isEditable={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditAgistmentDetail;
