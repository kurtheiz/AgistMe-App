import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../../services/agistment.service';
import { AgistmentResponse } from '../../types/agistment';
import { ChevronLeft, Heart, Share2 } from 'lucide-react';
import { PageToolbar } from '../../components/PageToolbar';
import '../../styles/gallery.css';
import { AgistmentHeader } from '../../components/Agistment/AgistmentHeader';
import { AgistmentPaddocks } from '../../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../../components/Agistment/AgistmentCareOptions';
import { AgistmentServices } from '../../components/Agistment/AgistmentServices';
import { AgistmentPhotosView } from '../../components/Agistment/AgistmentPhotosView';
import { useFavorite } from '../../hooks/useFavorite';
import { AgistmentMap } from '../../components/Map/AgistmentMap';
import { EnquiryModal } from '../../components/Agistment/EnquiryModal';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function ViewAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<AgistmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, isLoading: isFavoriteLoading, toggleFavorite } = useFavorite(agistment!);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await agistmentService.getAgistment(id, true);
        setAgistment(data);
        
        // Track page view in Google Analytics
        window.gtag('event', 'page_view', {
          page_title: data.basicInfo?.name || 'Agistment Details',
          page_location: window.location.href,
          agistment_id: id,
          agistment_name: data.basicInfo?.name,
          agistment_location: data.propertyLocation?.location?.suburb
        });
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

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-neutral-900">
      <div className="sticky top-0 z-50">
        <PageToolbar
          actions={
            <div className="w-full">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
      </div>

      {/* Sticky Enquire Now Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="w-full sm:w-auto min-w-[200px] px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Enquire Now
          </button>
          <div className="flex gap-4 ml-6">
            {agistment && (
              <>
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  disabled={isFavoriteLoading || !agistment}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-neutral-600'}`} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Agist Me',
                        text: `Look at what I found on Agist Me.\n${agistment?.basicInfo.name} located in ${agistment?.propertyLocation.location?.suburb}, ${agistment?.propertyLocation.location?.state}`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        agistmentName={agistment.basicInfo.name}
        agistmentId={id || ''}
      />

      <div className="pb-20">
        <div className="sm:max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4">
            {/* Photo Gallery Section */}
            <div>
              <AgistmentPhotosView
                photos={agistment.photoGallery?.photos || []}
              />
            </div>

            {/* All content below photo gallery */}
            <div className="px-4 sm:px-4 flex flex-col space-y-8">
              {/* Header Section */}
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
                <AgistmentHeader
                  basicInfo={agistment.basicInfo}
                  propertyLocation={agistment.propertyLocation}
                  contactDetails={agistment.contact}
                  propertyDescription={agistment.propertyDescription}
                  socialMedia={agistment.socialMedia}
                />
                {agistment.propertyLocation?.location && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">Location</h2>
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <AgistmentMap
                        address={`${agistment.propertyLocation.location.address}, ${agistment.propertyLocation.location.suburb}, ${agistment.propertyLocation.location.state}, Australia ${agistment.propertyLocation.location.postcode}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Paddocks and Care Options Grid */}
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch lg:divide-x lg:divide-neutral-200 lg:dark:divide-neutral-800">
                  {/* Paddocks Section */}
                  <div className="lg:sticky lg:top-[120px]">
                    <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                      Paddock Management
                    </h2>
                    <AgistmentPaddocks
                      paddocks={agistment.paddocks}
                    />
                  </div>

                  {/* Care Options Section */}
                  <div className="lg:pl-8">
                    <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                      Care Options
                    </h2>
                    <AgistmentCareOptions
                      care={agistment.care}
                    />
                  </div>
                </div>
              </div>

              {/* Riding Facilities and Property Facilities Grid */}
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Riding Facilities Section */}
                  <div className="lg:sticky lg:top-[120px] border-b lg:border-b-0 pb-8 lg:pb-0 border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                      Riding Facilities
                    </h2>
                    <AgistmentRidingFacilities
                      ridingFacilities={agistment.ridingFacilities}
                    />
                  </div>

                  {/* Property Facilities Section */}
                  <div className="lg:border-l lg:border-neutral-200 lg:dark:border-neutral-800 lg:pl-8">
                    <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">
                      Property Facilities
                    </h2>
                    <AgistmentFacilities
                      facilities={agistment.facilities}
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
                  services={agistment.propertyServices.services}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
