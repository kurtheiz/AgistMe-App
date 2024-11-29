import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { ArrowLeftIcon } from '../components/Icons';
import { ShareIcon } from '@heroicons/react/24/outline';
import { PageToolbar } from '../components/PageToolbar';
import '../styles/gallery.css';
import { AgistmentBasicInfo } from '../components/Agistment/AgistmentBasicInfo';
import { AgistmentContact } from '../components/Agistment/AgistmentContact';
import { AgistmentLocation } from '../components/Agistment/AgistmentLocation';
import { AgistmentDescription } from '../components/Agistment/AgistmentDescription';
import { AgistmentPaddocks } from '../components/Agistment/AgistmentPaddocks';
import { AgistmentRidingFacilities } from '../components/Agistment/AgistmentRidingFacilities';
import { AgistmentFacilities } from '../components/Agistment/AgistmentFacilities';
import { AgistmentCareOptions } from '../components/Agistment/AgistmentCareOptions';
import { AgistmentServices } from '../components/Agistment/AgistmentServices';
import { AgistmentSocialMedia } from '../components/Agistment/AgistmentSocialMedia';
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
        {/* Photo Gallery and Location Details Section */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Photo Gallery - 66% width on desktop */}
              <div className="w-full lg:w-2/3 px-4">
                <AgistmentPhotosView photos={agistment.photoGallery?.photos} />
              </div>

              {/* Location Details - 33% width on desktop */}
              <div className="w-full lg:w-1/3 px-4">
                {/* Share Button */}
                <div className="flex gap-2 mb-6">
                  <button className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400">
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>

                <AgistmentBasicInfo
                  agistmentId={agistment.id}
                  basicInfo={agistment.basicInfo}
                  isEditable={false}
                />

                <div className="space-y-6">
                  <AgistmentLocation
                    agistmentId={agistment.id}
                    location={agistment.propertyLocation.location}
                    isEditable={false}
                  />

                  <AgistmentContact
                    agistmentId={agistment.id}
                    contactDetails={agistment.contact.contactDetails}
                    isEditable={false}
                  />

                  {/* Enquire Now Button */}
                  <button className="mt-6 w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg text-center hover:bg-red-700 transition-colors">
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 sm:py-8">
          {/* Description Section */}
          <AgistmentDescription
            agistmentId={agistment.id}
            description={agistment.propertyDescription.description}
            isEditable={false}
          />

          {/* Paddocks */}
          <AgistmentPaddocks
            agistmentId={agistment.id}
            paddocks={agistment.paddocks}
            isEditable={false}
          />

          {/* Arenas and Roundyards */}
          <AgistmentRidingFacilities
            agistmentId={agistment.id}
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
            agistmentId={agistment.id}
            care={agistment.care}
            isEditable={false}
          />

          {/* Services */}
          <AgistmentServices
            agistmentId={agistment.id}
            propertyServices={agistment.propertyServices}
            isEditable={false}
          />

          {/* Social Media */}
          <AgistmentSocialMedia
            agistmentId={agistment.id}
            socialMedia={agistment.socialMedia}
            isEditable={false}
          />
        </div>
      </div>
    </div>
  );
}
