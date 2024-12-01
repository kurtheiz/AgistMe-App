import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { ArrowLeftIcon } from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import { ShareFavoriteButtons } from '../components/shared/ShareFavoriteButtons';
import '../styles/gallery.css';
import { AgistmentHeader } from '../components/Agistment/AgistmentHeader';
import { AgistmentDescription } from '../components/Agistment/AgistmentDescription';
import { AgistmentPaddocks } from '../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../components/Agistment/AgistmentCareOptions';
import { AgistmentServices } from '../components/Agistment/AgistmentServices';
import { AgistmentPhotosView } from '../components/Agistment/AgistmentPhotosView';

export function ViewAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) return;

      try {
        setLoading(true);
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

      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-8 p-4">
            {/* Photo Gallery Section */}
            <div className="w-full">
              <AgistmentPhotosView
                photos={agistment.photoGallery?.photos || []}
              />
            </div>

            {/* Header Section */}
            <AgistmentHeader
              basicInfo={agistment.basicInfo}
              propertyLocation={agistment.propertyLocation.location}
              contactDetails={agistment.contact}
              propertyDescription={agistment.propertyDescription}
            />

            {/* Paddocks Section */}
            <AgistmentPaddocks
              paddocks={agistment.paddocks}
            />



            {/* Riding Facilities */}
            <AgistmentRidingFacilities
              ridingFacilities={agistment.ridingFacilities}
              isEditable={false}
            />

            {/* Facilities */}
            <AgistmentFacilities
              agistmentId={agistment.id}
              facilities={agistment.facilities}
              isEditable={false}
            />

            {/* Care Options */}
            <AgistmentCareOptions
              care={agistment.care}
              isEditable={false}
            />

            {/* Services */}
            <AgistmentServices
              services={agistment.propertyServices.services}
              isEditable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
