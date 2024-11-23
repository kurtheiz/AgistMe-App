import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { 
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
  PhotoIcon,
  MapPinIcon,
  ArrowLeftIcon,
  RefreshIcon
} from './Icons';
import { PageToolbar } from './PageToolbar';

const LAST_SEARCH_KEY = 'agistme_last_search';

export function AgistmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agistment, setAgistment] = useState<Agistment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
          const foundAgistment = lastSearch.response.original.find((a: Agistment) => a.id === id);
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

  // Function to refresh agistment data
  const refreshAgistment = useCallback(async () => {
    if (!id || refreshing) return;
    
    setRefreshing(true);
    try {
      const data = await agistmentService.getAgistment(id);
      setAgistment(data);
      setError(null);

      // Update the agistment in localStorage if it exists there
      const storedSearch = localStorage.getItem(LAST_SEARCH_KEY);
      if (storedSearch) {
        const lastSearch = JSON.parse(storedSearch);
        const index = lastSearch.response.original.findIndex((a: Agistment) => a.id === id);
        if (index !== -1) {
          lastSearch.response.original[index] = data;
        }
        localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(lastSearch));
      }
    } catch (err) {
      setError('Failed to refresh agistment details');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, [id, refreshing]);

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
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
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
    <div className="min-h-screen flex flex-col relative">
      <PageToolbar 
        actions={
          <div className="w-full flex items-center justify-between -ml-2 sm:-ml-3">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-600 mx-1">|</span>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 overflow-hidden">
                <span className="truncate">{agistment.location.state}</span>
                <span className="text-neutral-300 dark:text-neutral-600 shrink-0">&gt;</span>
                <span className="truncate">{agistment.location.region}</span>
                <span className="text-neutral-300 dark:text-neutral-600 shrink-0">&gt;</span>
                <span className="truncate">{agistment.location.suburb}</span>
              </div>
            </div>
            <button
              onClick={refreshAgistment}
              disabled={refreshing}
              className="hidden sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />
      
      <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 lg:px-8 sm:py-8">
        <div className="bg-white dark:bg-neutral-800 sm:rounded-lg sm:shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-primary-600 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-semibold text-white">{agistment.name}</h1>
              {agistment.urgentAvailability && (
                <ExclamationTriangleIcon 
                  className="w-8 h-8 text-red-500 dark:text-red-400" 
                  aria-label="Urgent listing"
                />
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          {agistment.photos && agistment.photos.length > 0 ? (
            <div className="relative w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-700">
              <img 
                src={agistment.photos[0].link} 
                alt={`${agistment.name} - ${agistment.photos[0].comment || 'Primary photo'}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
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
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">About this Property</h2>
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{agistment.description}</p>
            </div>
          )}

          {/* Paddocks */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Paddocks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {agistment.privatePaddocks && (
                <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Private Paddocks</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {agistment.privatePaddocks.available} of {agistment.privatePaddocks.total} available
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    ${agistment.privatePaddocks.weeklyPrice}/week
                  </p>
                </div>
              )}
              {agistment.sharedPaddocks && (
                <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Shared Paddocks</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {agistment.sharedPaddocks.available} of {agistment.sharedPaddocks.total} available
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    ${agistment.sharedPaddocks.weeklyPrice}/week
                  </p>
                </div>
              )}
              {agistment.groupPaddocks && (
                <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Group Paddocks</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {agistment.groupPaddocks.available} of {agistment.groupPaddocks.total} available
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    ${agistment.groupPaddocks.weeklyPrice}/week
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'arena', label: 'Arena', icon: ArenaIcon, available: agistment.arenas.length > 0 },
                { key: 'roundYard', label: 'Round Yard', icon: RoundYardIcon, available: agistment.roundYards.length > 0 },
                { key: 'feedRoom', label: 'Feed Room', icon: FeedRoomIcon, available: agistment.feedRoom.available },
                { key: 'tackRoom', label: 'Tack Room', icon: TackRoomIcon, available: agistment.tackRoom.available },
                { key: 'floatParking', label: 'Float Parking', icon: FloatParkingIcon, available: agistment.floatParking.available },
                { key: 'hotWash', label: 'Hot Wash', icon: HotWashIcon, available: agistment.hotWash.available },
                { key: 'stables', label: 'Stables', icon: StableIcon, available: agistment.stables.available },
                { key: 'tieUp', label: 'Tie Up', icon: TieUpIcon, available: agistment.tieUp.available }
              ].map(({ key, label, icon: Icon, available }) => (
                <div key={key} className={`flex items-center gap-2 ${available ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-600'}`}>
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="text-sm flex items-center gap-1">
                    {label}
                    {available ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          {agistment.contactDetails && (
            <div className="p-6 bg-neutral-50 dark:bg-neutral-700 rounded-b-lg">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Contact</h2>
              <div className="space-y-2">
                <p className="text-neutral-700 dark:text-neutral-300">
                  {agistment.contactDetails.name}
                </p>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Phone: {agistment.contactDetails.number}
                </p>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Email: {agistment.contactDetails.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
