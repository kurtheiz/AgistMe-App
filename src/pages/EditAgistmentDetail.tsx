import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { formatAvailabilityDate } from '../utils/dates';
import { calculateMonthlyPrice } from '../utils/prices';
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
  EditIcon
} from '../components/Icons';
import { useProfile } from '../context/ProfileContext';
import { useAgistmentStore } from '../stores/agistment.store';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import { LAST_SEARCH_KEY } from '../constants/storage';
import { ShareIcon } from '@heroicons/react/24/outline';
import { PageToolbar } from '../components/PageToolbar';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import '../styles/gallery.css';

// Use the same key as in Agistments.tsx

export function EditAgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, updateProfileData } = useProfile();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const getTempAgistment = useAgistmentStore(state => state.getTempAgistment);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    propertySize: 0
  });
  const [nameError, setNameError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const updateLocalStorageAgistment = (updatedAgistment: Agistment) => {
    console.log('Starting localStorage update for agistment:', updatedAgistment.id);
    try {
      // Clean up the agistment data to ensure consistent structure
      const cleanedAgistment = {
        ...updatedAgistment,
        createdAt: updatedAgistment.createdAt || updatedAgistment.modifiedAt,
      };

      let storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
      let lastSearch;

      if (storedSearch) {
        lastSearch = JSON.parse(storedSearch);
        let updated = false;

        // Update in original array if exists
        if (lastSearch.response?.original) {
          const originalIndex = lastSearch.response.original.findIndex((a: Agistment) => a.id === cleanedAgistment.id);
          if (originalIndex !== -1) {
            lastSearch.response.original[originalIndex] = cleanedAgistment;
            updated = true;
          }
        }

        // Update in adjacent array if exists
        if (lastSearch.response?.adjacent) {
          const adjacentIndex = lastSearch.response.adjacent.findIndex((a: Agistment) => a.id === cleanedAgistment.id);
          if (adjacentIndex !== -1) {
            lastSearch.response.adjacent[adjacentIndex] = cleanedAgistment;
            updated = true;
          }
        }

        // If the agistment wasn't found in either array, create new search results
        if (!updated) {
          lastSearch = {
            response: {
              original: [cleanedAgistment],
              adjacent: [],
              hash: '' // Empty hash for new search
            }
          };
        }
      } else {
        // Create new search results if none exist
        lastSearch = {
          response: {
            original: [cleanedAgistment],
            adjacent: [],
            hash: '' // Empty hash for new search
          }
        };
      }

      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(lastSearch));
      console.log('Updated localStorage with new data:', lastSearch);
    } catch (error) {
      console.error('Error updating localStorage:', error);
      toast.error('Failed to update search results');
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const preventScroll = (e: Event) => {
      if (isGalleryExpanded) {
        e.preventDefault();
      }
    };

    if (isGalleryExpanded) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isGalleryExpanded]);

  useEffect(() => {
    const loadAgistment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('Loading agistment with ID:', id);
        // Check if it's a temporary agistment
        if (id.startsWith('temp_')) {
          console.log('Loading temp agistment');
          const tempAgistment = getTempAgistment(id);
          if (tempAgistment) {
            setAgistment(tempAgistment);
          } else {
            setError('Temporary agistment not found');
          }
        } else {
          console.log('Loading existing agistment from API');
          // Only load from API if it's not a temp ID
          const data = await agistmentService.getAgistment(id);
          console.log('Agistment data received:', data);
          setAgistment(data);
        }
      } catch (err) {
        console.error('Error loading agistment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load agistment');
      } finally {
        setLoading(false);
      }
    };

    loadAgistment();
  }, [id, getTempAgistment]);

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
      setShouldShowReadMore(isOverflowing);
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

  const handlePublish = async () => {
    if (!agistment) return;
    
    setIsPublishing(true);
    try {
      // Send the complete agistment data with hidden set to false
      const updatedAgistment = await agistmentService.updateAgistment(agistment.id, {
        ...agistment,
        hidden: false
      });

      // Update localStorage
      updateLocalStorageAgistment(updatedAgistment);

      // If this was a temp agistment, add it to profile's myAgistments and remove from temp store
      if (agistment.id.startsWith('temp_')) {
        // Add to profile's myAgistments
        if (profile && !profile.myAgistments?.includes(updatedAgistment.id)) {
          // Update the profile's myAgistments array
          const updatedMyAgistments = [...(profile.myAgistments || []), updatedAgistment.id];
          await updateProfileData({ ...profile, myAgistments: updatedMyAgistments });
        }

        // Remove from temp store
        const removeTempAgistment = useAgistmentStore.getState().removeTempAgistment;
        removeTempAgistment(agistment.id);
      }

      // Navigate to the published agistment's detail view
      navigate(`/agistments/${updatedAgistment.id}`);
      
      toast.success('Agistment published successfully!');
    } catch (error) {
      console.error('Error publishing agistment:', error);
      toast.error('Failed to publish agistment');
    } finally {
      setIsPublishing(false);
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
                  disabled
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 rounded-lg text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
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

      {/* Edit/Create Mode Banner */}
      <div className="sticky top-14 z-30 w-full bg-primary-600 dark:bg-primary-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <h1 className="text-lg font-medium text-white">
                {id?.startsWith('temp_') ? 'Creating' : 'Editing'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 rounded-md border border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-3 py-1.5 text-sm font-medium bg-white text-primary-600 hover:bg-white/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
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
                {galleryImages.length > 0 ? (
                  <div 
                    className={`relative w-full ${
                      isGalleryExpanded ? 'fixed inset-0 z-[9999] h-screen w-screen bg-black/95 overflow-hidden' : ''
                    }`}
                    onClick={(e) => isGalleryExpanded && e.stopPropagation()}
                  >
                    <ImageGallery
                      items={galleryImages}
                      thumbnailPosition="bottom"
                      showThumbnails={false}
                      showPlayButton={false}
                      showBullets={true}
                      showFullscreenButton={true}
                      useBrowserFullscreen={false}
                      onScreenChange={setIsGalleryExpanded}
                      additionalClass={isGalleryExpanded ? 'fullscreen-gallery' : ''}
                      renderItem={(item: { original: string; description?: string }) => (
                        <div className='image-gallery-image'>
                          <img
                            src={item.original}
                            alt={item.description || ''}
                            className="gallery-image"
                          />
                          {item.description && (
                            <span className='image-gallery-description text-neutral-900 dark:text-white'>
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                    />
                  </div>
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
                  <div 
                    className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400"
                    title="Not available while editing"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </div>
                  <div 
                    className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-400"
                    title="Not available while editing"
                  >
                    <FavouriteIcon className="w-5 h-5" />
                    <span className="text-sm">Favorite</span>
                  </div>
                </div>

                {/* Agistment Name */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {agistment.name}
                      </h2>
                      <p className="text-neutral-900 dark:text-neutral-400 mt-1">
                        {agistment.propertySize && agistment.propertySize > 0 ? `${agistment.propertySize} acres` : 'Property size not specified'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditForm({
                          name: agistment.name,
                          propertySize: agistment.propertySize || 0
                        });
                        setIsEditDialogOpen(true);
                      }}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </button>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-6">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="group relative">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Location</h3>
                          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                          </button>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-400">
                          {agistment.location.address}
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-400">
                          {agistment.location.suburb}, {agistment.location.state} {agistment.location.postcode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-400">Contact Details</h3>
                      <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                    {agistment.contactDetails.name && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <span className="text-neutral-900 dark:text-white font-medium">
                          {agistment.contactDetails.name}
                        </span>
                      </div>
                    )}
                    {agistment.contactDetails.number && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <span className="text-neutral-700 dark:text-neutral-400">
                          {agistment.contactDetails.number}
                        </span>
                      </div>
                    )}
                    {agistment.contactDetails.email && (
                      <div className="flex items-center gap-2">
                        <EmailIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
                        <span className="text-neutral-700 dark:text-neutral-400">
                          {agistment.contactDetails.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enquire Now Button */}
                  <div
                    title="Not available while editing"
                    className="mt-6 w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg text-center"
                  >
                    Enquire Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 sm:py-8">
          {/* Description Section */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">About this Property</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="relative">
              <p 
                ref={descriptionRef}
                className={`text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-4 max-h-24' : ''}`}
              >
                {agistment.description}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                  {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          {/* Paddocks */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Paddocks Available</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Private Paddocks */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Private
                </span>
                <div className="flex flex-col items-center pt-2">
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
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Riding Facilities</h3>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Arenas */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Arenas
                </span>
                <div className="flex flex-col items-center pt-2">
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Facilities</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {/* Feed Room */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment.feedRoom.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <FeedRoomIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Feed Room</span>
                {agistment.feedRoom.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.feedRoom.comments}
                  </p>
                )}
              </div>

              {/* Float Parking */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment.floatParking.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <FloatParkingIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Float Parking</span>
                {agistment.floatParking.available && (
                  <>
                    {agistment.floatParking.monthlyPrice >= 0 && (
                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        ${agistment.floatParking.monthlyPrice}
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
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
                <div className={`w-12 h-12 mb-2 ${agistment.hotWash.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <HotWashIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Hot Wash</span>
                {agistment.hotWash.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.hotWash.comments}
                  </p>
                )}
              </div>

              {/* Stables */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment.stables.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <StableIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Stables</span>
                {agistment.stables.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.stables.comments}
                  </p>
                )}
              </div>

              {/* Tack Room */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment.tackRoom.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <TackRoomIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Tack Room</span>
                {agistment.tackRoom.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.tackRoom.comments}
                  </p>
                )}
              </div>

              {/* Tie Up */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 mb-2 ${agistment.tieUp.available ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  <TieUpIcon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">Tie Up</span>
                {agistment.tieUp.comments && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                    {agistment.tieUp.comments}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Care Options */}
          <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Care Options</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Full Care */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
                <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
                  Full Care
                </span>
                <div className="flex flex-col items-center pt-2">
                  <span className={`mb-2 text-sm font-medium px-3 py-1.5 rounded-lg ${
                    agistment.fullCare.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment.fullCare.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment.fullCare.available && (
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
                    agistment.partCare.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment.partCare.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment.partCare.available && (
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
                    agistment.selfCare.available 
                      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}>
                    {agistment.selfCare.available ? 'Available' : 'Unavailable'}
                  </span>
                  {agistment.selfCare.available && (
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Services</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            {agistment.services && agistment.services.length > 0 ? (
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Social Media & Links</h2>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            {agistment.socialMedia && agistment.socialMedia.length > 0 ? (
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-neutral-800 p-6 w-full">
            <Dialog.Title className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Edit Property Details
            </Dialog.Title>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editForm.name.length < 2) {
                setNameError('Name must be at least 2 characters long');
                return;
              }
              if (agistment) {
                setAgistment({
                  ...agistment,
                  name: editForm.name,
                  propertySize: editForm.propertySize
                });
              }
              setNameError('');
              setIsEditDialogOpen(false);
            }}>
              <fieldset className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, name: e.target.value }));
                      if (e.target.value.length >= 2) {
                        setNameError('');
                      }
                    }}
                    className={`w-full rounded-md border ${nameError ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} px-3 py-2 text-neutral-900 dark:text-white bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 ${nameError ? 'focus:ring-red-500' : 'focus:ring-primary-500'}`}
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-500">
                      {nameError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Property Size (acres)
                  </label>
                  <input
                    type="number"
                    value={editForm.propertySize || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setEditForm(prev => ({ ...prev, propertySize: value }));
                    }}
                    min="0"
                    step="1"
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-white bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </fieldset>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
