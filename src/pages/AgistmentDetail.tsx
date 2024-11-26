import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { formatAvailabilityDate } from '../utils/dates';
import { calculateMonthlyPrice } from '../utils/prices';
import { 
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
  PhotoIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckIcon,
  CrossIcon
} from '../components/Icons';
import { PageToolbar } from '../components/PageToolbar';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import '../styles/gallery.css';

const LAST_SEARCH_KEY = 'agistme_last_search';

export function AgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const maxLength = 300; // Maximum characters to show before "Read More"
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) {
        setError('No agistment ID provided');
        setLoading(false);
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
            setLoading(false);
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
      } finally {
        setLoading(false);
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

  // Update content height when content changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [agistment?.description]);

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

  const getGoogleMapsUrl = (location: Agistment['location']) => {
    if (!location) return '#';
    const query = `${location.address ? location.address + ',' : ''} ${location.suburb}, ${location.state} ${location.postCode}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-neutral-900">
      <PageToolbar 
        actions={
          <div className="w-full overflow-hidden">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeftIcon className="w-3 h-3" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
              <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap sm:max-h-[calc(100vh-16rem)] overflow-x-auto sm:overflow--scroll">
                <span>{agistment.location.state}</span>
                <span className="text-neutral-300 dark:text-neutral-600 shrink-0">&gt;</span>
                <span>{agistment.location.region}</span>
                <span className="text-neutral-300 dark:text-neutral-600 shrink-0">&gt;</span>
                <span>{agistment.location.suburb}</span>
              </div>
            </div>
          </div>
        }
      />
      
      <div className="w-full">
        {/* Header Section - Full Width */}
        <div className="title-header">
          <div className="w-full max-w-5xl mx-auto px-6 py-4 sm:py-6">
            <div className="flex justify-center items-center gap-4">
              <h1 className="title-text truncate">
                {agistment.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        {galleryImages.length > 0 ? (
          <div className={`relative w-full ${
            isGalleryExpanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black' : ''
          }`}>
            <ImageGallery
              items={galleryImages}
              thumbnailPosition="bottom"
              showThumbnails={false}
              showPlayButton={false}
              showBullets={true}
              showFullscreenButton={true}
              useBrowserFullscreen={false}
              onScreenChange={setIsGalleryExpanded}
              renderItem={(item) => (
                <div className='image-gallery-image'>
                  <img
                    src={item.original}
                    alt={item.description || ''}
                    className="gallery-image"
                  />
                  {item.description && (
                    <span className='image-gallery-description'>
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        ) : (
          <div className="relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <div className="text-neutral-400 dark:text-neutral-300 flex flex-col items-center">
              <PhotoIcon className="w-12 h-12 mb-2" />
              <span className="text-sm">No photos available</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 lg:px-8 sm:py-8">
          {/* Status Information */}
          {agistment.urgentAvailability && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6 mx-6">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <p className="text-amber-800 dark:text-amber-300">Urgent Availability</p>
              </div>
            </div>
          )}
          
          {/* Location */}
          {agistment.location && (
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <a
                href={getGoogleMapsUrl(agistment.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                <MapPinIcon className="h-5 w-5" />
                <span>
                {agistment.location.address}, {agistment.location.suburb}, {agistment.location.state} {agistment.location.postCode}
                </span>
              </a>
            </div>
          )}

          {/* Description */}
          {agistment.description && (
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">About this Property</h2>
              <div>
                <div 
                  className={`relative overflow-hidden transition-[max-height] duration-500 ease-in-out`}
                  style={{ maxHeight: isExpanded ? `${contentHeight}px` : '150px' }}
                >
                  <div ref={contentRef}>
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap pr-4">
                      {agistment.description}
                    </p>
                  </div>
                </div>
                
                {agistment.description.length > maxLength && (
                  <div className="relative">
                    {!isExpanded && (
                      <div 
                        className="absolute -mt-[100px] pt-[60px] pb-[40px] inset-x-0 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent"
                      />
                    )}
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors mt-2"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paddocks */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Paddocks Available</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Private Paddocks */}
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-base text-neutral-900 dark:text-white font-medium mb-2">
                    Private
                  </span>
                  {agistment.privatePaddocks.total > 0 ? (
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
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
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
                    <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Shared Paddocks */}
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-base text-neutral-900 dark:text-white font-medium mb-2">
                    Shared
                  </span>
                  {agistment.sharedPaddocks.total > 0 ? (
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
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
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
                    <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Group Paddocks */}
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-base text-neutral-900 dark:text-white font-medium mb-2">
                    Group
                  </span>
                  {agistment.groupPaddocks.total > 0 ? (
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
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
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
                    <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Arenas and Roundyards */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Riding Facilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Arenas */}
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-base text-neutral-900 dark:text-white font-medium mb-2">
                    Arenas
                  </span>
                  {agistment.arenas && agistment.arenas.length > 0 ? (
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
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
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
                    <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg">
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
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-base text-neutral-900 dark:text-white font-medium mb-2">
                    Round Yards
                  </span>
                  {agistment.roundYards && agistment.roundYards.length > 0 ? (
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
                    <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg">
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
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  key: 'feedRoom', 
                  label: 'Feed Room', 
                  icon: FeedRoomIcon, 
                  available: agistment.feedRoom.available,
                  comments: agistment.feedRoom.comments
                },
                { 
                  key: 'tackRoom', 
                  label: 'Tack Room', 
                  icon: TackRoomIcon, 
                  available: agistment.tackRoom.available,
                  comments: agistment.tackRoom.comments
                },
                { 
                  key: 'floatParking', 
                  label: 'Float Parking', 
                  icon: FloatParkingIcon, 
                  available: agistment.floatParking.available,
                  comments: agistment.floatParking.comments,
                  price: agistment.floatParking.monthlyPrice
                },
                { 
                  key: 'hotWash', 
                  label: 'Hot Wash', 
                  icon: HotWashIcon, 
                  available: agistment.hotWash.available,
                  comments: agistment.hotWash.comments
                },
                { 
                  key: 'stables', 
                  label: 'Stables', 
                  icon: StableIcon, 
                  available: agistment.stables.available,
                  comments: agistment.stables.comments
                },
                { 
                  key: 'tieUp', 
                  label: 'Tie Up', 
                  icon: TieUpIcon, 
                  available: agistment.tieUp.available,
                  comments: agistment.tieUp.comments
                }
              ].map(({ key, label, icon: Icon, available, comments, price }) => (
                <div key={key} className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      {Icon && <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-900 dark:text-white">
                            {label}
                          </span>
                          <span>
                            {available ? (
                              <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            ) : (
                              <CrossIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                          </span>
                        </div>
                        {available && price !== undefined && (
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                            ${price}/month
                          </p>
                        )}
                        {comments && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {comments}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Options */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Care Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Full Care */}
              {agistment.fullCare.available && (
                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-medium text-neutral-900 dark:text-white mb-2">Full Care</span>
                    <p className="text-base font-bold text-neutral-900 dark:text-white">
                      ${agistment.fullCare.monthlyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                    {agistment.fullCare.comments && (
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.fullCare.comments}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Part Care */}
              {agistment.partCare.available && (
                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-medium text-neutral-900 dark:text-white mb-2">Part Care</span>
                    <p className="text-base font-bold text-neutral-900 dark:text-white">
                      ${agistment.partCare.monthlyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                    {agistment.partCare.comments && (
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.partCare.comments}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Self Care */}
              {agistment.selfCare.available && (
                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-medium text-neutral-900 dark:text-white mb-2">Self Care</span>
                    <p className="text-base font-bold text-neutral-900 dark:text-white">
                      ${agistment.selfCare.monthlyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                    {agistment.selfCare.comments && (
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 text-center">{agistment.selfCare.comments}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {agistment.services && agistment.services.length > 0 && (
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Additional Services</h2>
              <div className="flex flex-wrap gap-3">
                {agistment.services.map((service, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 rounded-lg"
                  >
                    <CheckIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {agistment.socialMedia && agistment.socialMedia.length > 0 && (
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Social Media & Links</h2>
              <div className="flex flex-wrap gap-4">
                {agistment.socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    {social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
