import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { formatAvailabilityDate } from '../utils/dates';
import { calculateMonthlyPrice } from '../utils/prices';
import { getGoogleMapsUrl } from '../utils/location';
import { 
  PhotoIcon,
  ArrowLeftIcon,
  EmailIcon,
  PhoneIcon,
  UserIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
  FavouriteIcon,
  ShareIcon
} from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import '../styles/gallery.css';
import toast from 'react-hot-toast';
import { useProfile } from '../context/ProfileContext';
import { LAST_SEARCH_KEY } from '../constants/storage';

export function AgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught in error boundary:', error);
      if (mountedRef.current) {
        setError(error.message || 'An unexpected error occurred');
        toast.error(error.message || 'An unexpected error occurred');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) {
        console.log('No agistment ID provided');
        setError('No agistment ID provided');
        return;
      }

      // First try to find the agistment in local storage
      try {
        const storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
        if (storedSearch) {
          const lastSearch = JSON.parse(storedSearch);
          // Check both original and adjacent arrays
          const foundAgistment = 
            (lastSearch.response.original && lastSearch.response.original.find((a: Agistment) => a.id === id)) ||
            (lastSearch.response.adjacent && lastSearch.response.adjacent.find((a: Agistment) => a.id === id));
          
          if (foundAgistment) {
            setAgistment(foundAgistment);
            return;
          }
        }
      } catch (err) {
        console.error('Error parsing local storage:', err);
      }

      // If not found in local storage, fetch from API
      try {
        const data = await agistmentService.getAgistment(id);
        setAgistment(data);
        setError(null);
      } catch (err) {
        setError('Failed to load agistment details');
        console.error(err);
      }
    };

    loadAgistment();
  }, [id]);

  useEffect(() => {
    if (agistment?.photos) {
      const images = agistment.photos.map(photo => ({
        original: photo.link,
        thumbnail: photo.link,
        description: photo.comment || '',
        thumbnailHeight: "100",
        thumbnailWidth: "150",
      }));
      setGalleryImages(images);
    }
  }, [agistment?.photos]);

  // Check if description needs read more button
  useEffect(() => {
    if (descriptionRef.current) {
      const isOverflowing = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionExpanded(isOverflowing);
    }
  }, [agistment?.description]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const imageGalleryProps = {
    items: galleryImages,
    thumbnailPosition: "bottom" as const,
    showThumbnails: true,
    showPlayButton: false,
    showBullets: true,
    showFullscreenButton: true,
    useBrowserFullscreen: true,
    onScreenChange: () => {}, // Empty callback to satisfy TypeScript
    additionalClass: "image-gallery-custom",
    renderItem: (item: any) => (
      <div className="image-gallery-image-container">
        <img 
          src={item.original} 
          alt={item.description || 'Agistment Image'} 
          className="image-gallery-image"
        />
      </div>
    )
  };

  if (error || !agistment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {error || 'The agistment could not be found. It may have been deleted or is still being processed.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors mb-4"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:underline"
        >
          Go back home
        </button>
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
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
                >
                  <ArrowLeftIcon className="w-3 h-3" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
                <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
                <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-neutral-900 dark:text-white whitespace-nowrap sm:max-h-[calc(100vh-16rem)] overflow-x-auto sm:overflow--scroll">
                  {agistment?.location && (
                    <>
                      <span>{agistment.location.state}</span>
                      <span className="text-neutral-900 dark:text-white shrink-0">&gt;</span>
                      <span>{agistment.location.region}</span>
                      <span className="text-neutral-900 dark:text-white shrink-0">&gt;</span>
                      <span>{agistment.location.suburb}</span>
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
                {galleryImages.length > 0 ? (
                  <ImageGallery {...imageGalleryProps} />
                ) : (
                  <div className="relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <div className="text-neutral-500 dark:text-neutral-400 flex flex-col items-center">
                      <PhotoIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">No photos available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Location and Contact Details - 33% width on desktop */}
              <div className="w-full lg:w-1/3 p-4">
                {/* Share and Favorite Buttons */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      const shareUrl = window.location.href;
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: `${agistment.location.suburb} Agistment on AgistMe`,
                            text: `Check out this agistment ${agistment.name} in ${agistment.location.suburb}, ${agistment.location.region}, ${agistment.location.state}`,
                            url: shareUrl
                          });
                        } else {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success('Link copied to clipboard!');
                        }
                      } catch (error) {
                        console.error('Error sharing:', error);
                        toast.error('Failed to share');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                  {profile && (
                    <button
                      className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <FavouriteIcon className="w-5 h-5" />
                      <span className="text-sm">Favorite</span>
                    </button>
                  )}
                </div>

                {/* Agistment Name */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {agistment?.name}
                  </h2>
                  <p className="text-neutral-900 dark:text-neutral-400 mt-1">
                    {agistment?.propertySize && agistment.propertySize > 0 ? `${agistment.propertySize} acres` : 'Property size not specified'}
                  </p>
                </div>

                {/* Location Details */}
                <div className="space-y-6">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      {agistment?.location && (
                        <a 
                          href={getGoogleMapsUrl(agistment.location)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {agistment.location.address}
                          </h3>
                          <p className="text-neutral-700 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {agistment.location.suburb}, {agistment.location.state} {agistment.location.postcode}
                          </p>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    {agistment?.contactDetails?.name && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <span className="text-neutral-900 dark:text-white font-medium">
                          {agistment.contactDetails.name}
                        </span>
                      </div>
                    )}
                    {agistment?.contactDetails?.number && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <a
                          href={`tel:${agistment.contactDetails.number}`}
                          className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          {agistment.contactDetails.number}
                        </a>
                      </div>
                    )}
                    {agistment?.contactDetails?.email && (
                      <div className="flex items-center gap-2">
                        <EmailIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <a
                          href={`mailto:${agistment.contactDetails.email}`}
                          className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          {agistment.contactDetails.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Enquire Now Button */}
                  <button
                    onClick={() => {
                      if (agistment?.contactDetails?.email) {
                        window.location.href = `mailto:${agistment.contactDetails.email}?subject=Enquiry about ${agistment.name}&body=Hi ${agistment.contactDetails.name || ''},\n\nI am interested in your agistment property at ${agistment.location.suburb}.`;
                      }
                    }}
                    className="mt-6 w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 sm:py-8">
          {/* Description Section */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">About this Property</h2>
            <div className="relative">
              <p 
                ref={descriptionRef}
                className={`text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-4 max-h-24' : ''}`}
              >
                {agistment?.description}
              </p>
              {isDescriptionExpanded && (
                <button
                  onClick={() => setIsDescriptionExpanded(false)}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                  Show Less
                </button>
              )}
            </div>
          </div>

          {/* Paddocks */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Paddocks Available</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Private Paddocks */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Private
                </span>
                <div className="flex flex-col items-center pt-2">
                  {agistment?.privatePaddocks?.total > 0 ? (
                    <>
                      <div className="w-full grid grid-cols-2 gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                            agistment.privatePaddocks.available > 0
                              ? agistment.privatePaddocks.whenAvailable && new Date(agistment.privatePaddocks.whenAvailable) > new Date()
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                            } rounded-lg px-3 py-1.5`}
                          >
                            {`${agistment.privatePaddocks.available} of ${agistment.privatePaddocks.total}`}
                          </span>
                          {agistment.privatePaddocks.available > 0 && (
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                              {formatAvailabilityDate(agistment.privatePaddocks.whenAvailable ? new Date(agistment.privatePaddocks.whenAvailable) : null)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${agistment.privatePaddocks.weeklyPrice}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                          </p>
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${calculateMonthlyPrice(agistment.privatePaddocks.weeklyPrice)}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Shared Paddocks */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Shared
                </span>
                <div className="flex flex-col items-center pt-2">
                  {agistment?.sharedPaddocks?.total > 0 ? (
                    <>
                      <div className="w-full grid grid-cols-2 gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                            agistment.sharedPaddocks.available > 0
                              ? agistment.sharedPaddocks.whenAvailable && new Date(agistment.sharedPaddocks.whenAvailable) > new Date()
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                            } rounded-lg px-3 py-1.5`}
                          >
                            {`${agistment.sharedPaddocks.available} of ${agistment.sharedPaddocks.total}`}
                          </span>
                          {agistment.sharedPaddocks.available > 0 && (
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                              {formatAvailabilityDate(agistment.sharedPaddocks.whenAvailable ? new Date(agistment.sharedPaddocks.whenAvailable) : null)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${agistment.sharedPaddocks.weeklyPrice}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                          </p>
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${calculateMonthlyPrice(agistment.sharedPaddocks.weeklyPrice)}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Group Paddocks */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Group
                </span>
                <div className="flex flex-col items-center pt-2">
                  {agistment?.groupPaddocks?.total > 0 ? (
                    <>
                      <div className="w-full grid grid-cols-2 gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                            agistment.groupPaddocks.available > 0
                              ? agistment.groupPaddocks.whenAvailable && new Date(agistment.groupPaddocks.whenAvailable) > new Date()
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                            } rounded-lg px-3 py-1.5`}
                          >
                            {`${agistment.groupPaddocks.available} of ${agistment.groupPaddocks.total}`}
                          </span>
                          {agistment.groupPaddocks.available > 0 && (
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                              {formatAvailabilityDate(agistment.groupPaddocks.whenAvailable ? new Date(agistment.groupPaddocks.whenAvailable) : null)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${agistment.groupPaddocks.weeklyPrice}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                          </p>
                          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            ${calculateMonthlyPrice(agistment.groupPaddocks.weeklyPrice)}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Arenas and Roundyards */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Riding Facilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Arenas */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Arenas
                </span>
                <div className="flex flex-col items-center pt-2">
                  {agistment?.arenas && agistment.arenas.length > 0 ? (
                    <div className="w-full">
                      {agistment.arenas.map((arena, index) => (
                        <div key={index} className="flex flex-col w-full py-2 border-b last:border-0 border-neutral-200 dark:border-neutral-600">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {arena.length}m × {arena.width}m
                            </span>
                          </div>
                          {arena.comments && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {arena.comments}
                            </p>
                          )}
                          {arena.features && arena.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {arena.features.map((feature, featureIndex) => (
                                <span
                                  key={featureIndex}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : !agistment.arena ? (
                    <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                      None Available
                    </span>
                  ) : (
                    <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg">
                      Available
                    </span>
                  )}
                </div>
              </div>

              {/* Round Yards */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Round Yards
                </span>
                <div className="flex flex-col items-center pt-2">
                  {agistment?.roundYards && agistment.roundYards.length > 0 ? (
                    <div className="w-full">
                      {agistment.roundYards.map((yard, index) => (
                        <div key={index} className="flex flex-col w-full py-2 border-b last:border-0 border-neutral-200 dark:border-neutral-600">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {yard.diameter}m diameter
                            </span>
                          </div>
                          {yard.comments && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {yard.comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : !agistment.roundYard ? (
                    <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                      None Available
                    </span>
                  ) : (
                    <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg">
                      Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {/* Feed Room */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.feedRoom?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <FeedRoomIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Feed Room</span>
                {agistment?.feedRoom?.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.feedRoom.comments}
                  </p>
                )}
              </div>

              {/* Float Parking */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.floatParking?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <FloatParkingIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Float Parking</span>
                {agistment?.floatParking?.available && (
                  <>
                    {agistment.floatParking.monthlyPrice && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                        ${agistment.floatParking.monthlyPrice}/month
                      </p>
                    )}
                    {agistment.floatParking.comments && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                        {agistment.floatParking.comments}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Hot Wash */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.hotWash?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <HotWashIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Hot Wash</span>
                {agistment?.hotWash?.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.hotWash.comments}
                  </p>
                )}
              </div>

              {/* Stables */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.stables?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <StableIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Stables</span>
                {agistment?.stables?.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.stables.comments}
                  </p>
                )}
              </div>

              {/* Tack Room */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.tackRoom?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <TackRoomIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Tack Room</span>
                {agistment?.tackRoom?.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.tackRoom.comments}
                  </p>
                )}
              </div>

              {/* Tie Up */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment?.tieUp?.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <TieUpIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Tie Up</span>
                {agistment?.tieUp?.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.tieUp.comments}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Care Options */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Care Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Full Care */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Full Care
                </span>
                <div className="flex flex-col items-center pt-2">
                  <span className={`mb-2 text-sm font-medium px-3 py-1.5 rounded-lg ${
                    agistment?.fullCare?.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment?.fullCare?.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment?.fullCare?.available && (
                    <>
                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        ${agistment.fullCare.monthlyPrice}
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                      </p>
                      {agistment.fullCare.comments && (
                        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.fullCare.comments}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Part Care */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Part Care
                </span>
                <div className="flex flex-col items-center pt-2">
                  <span className={`mb-2 text-sm font-medium px-3 py-1.5 rounded-lg ${
                    agistment?.partCare?.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment?.partCare?.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment?.partCare?.available && (
                    <>
                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        ${agistment.partCare.monthlyPrice}
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                      </p>
                      {agistment.partCare.comments && (
                        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.partCare.comments}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Self Care */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Self Care
                </span>
                <div className="flex flex-col items-center pt-2">
                  <span className={`mb-2 text-sm font-medium px-3 py-1.5 rounded-lg ${
                    agistment?.selfCare?.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment?.selfCare?.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment?.selfCare?.available && (
                    <>
                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        ${agistment.selfCare.monthlyPrice}
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                      </p>
                      {agistment.selfCare.comments && (
                        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.selfCare.comments}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Services</h2>
            {agistment?.services && agistment.services.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {agistment.services.map((service, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 rounded-lg"
                  >
                    <span className="text-neutral-900 dark:text-white">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">No extra services</p>
            )}
          </div>

          {/* Social Media */}
          <div className="bg-white dark:bg-transparent p-6">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Social Media & Links</h2>
            {agistment?.socialMedia && agistment.socialMedia.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {agistment.socialMedia.map((social, index) => (
                  social.link ? (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
                    </a>
                  ) : (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400"
                    >
                      {social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
                    </span>
                  )
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">No social media links</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
