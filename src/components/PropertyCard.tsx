import { 
  ExclamationTriangleIcon,
  ShareIcon,
  MapPinIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
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
  CheckIcon,
  CrossIcon,
  FavouriteIcon
} from './Icons';
import { Agistment } from '../types/agistment';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getGoogleMapsUrl } from '../utils/location';
import { useUser } from '@clerk/clerk-react';

interface PropertyCardProps {
  property: Agistment;
  onClick?: () => void;
  isAdmin?: boolean;
  handleFavorite?: () => void;
}

export function PropertyCard({ property, onClick, isAdmin = false, handleFavorite }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isAdmin) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else {
      navigate(`/agistment/${property.id}`);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/agistment/${property.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${property.location.suburb} Agistment on AgistMe`,
          text: `Check out this agistment in ${property.location.suburb}, ${property.location.state}`,
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
  };

  return (
    <div 
      className={`relative w-full ${isAdmin ? '' : 'cursor-pointer'}`} 
      onClick={handleClick}
    >
      <div className={`overflow-hidden bg-white dark:bg-neutral-800 flex flex-col h-full w-full
                    shadow-lg hover:shadow-xl transition-shadow duration-300
                    border border-neutral-200 dark:border-neutral-700 rounded-none sm:rounded-lg
                    ${property.hidden ? 'opacity-40' : ''}`}>
        {/* Property Name Header */}
        <div className="title-header">
          <div className="flex justify-between items-start">
            {property.urgentAvailability && (
              <div className="absolute -top-1 -right-1 z-10">
                <ExclamationTriangleIcon 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 dark:text-red-400" 
                  aria-label="Urgent listing"
                />
              </div>
            )}
          </div>
          <h2 className="title-text truncate px-2">{property.name}</h2>
        </div>

        {/* Photo */}
        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-700">
          {property.photos && property.photos.length > 0 ? (
            <img 
              src={property.photos[0].link} 
              alt={`${property.name} - ${property.photos[0].comment || 'Primary photo'}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-neutral-400 dark:text-neutral-300 flex flex-col items-center">
                <PhotoIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">No photos</span>
              </div>
            </div>
          )}
        </div>

        {/* Location with icon and text */}
        {property.location && (
          <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700">
            <a
              href={getGoogleMapsUrl(property.location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
              title="Open in Google Maps"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-200 truncate">
            {property.location.address}, {property.location.suburb}, {property.location.state}
            </p>
          </div>
        )}

        {/* Availability Info */}
        <div className="px-5 py-3 bg-white dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Private Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  property.privatePaddocks.total > 0 
                    ? property.privatePaddocks.available > 0
                      ? property.privatePaddocks.whenAvailable && new Date(property.privatePaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {property.privatePaddocks.total > 0 ? property.privatePaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Private
                </span>
              </div>

              {/* Shared Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  property.sharedPaddocks.total > 0 
                    ? property.sharedPaddocks.available > 0
                      ? property.sharedPaddocks.whenAvailable && new Date(property.sharedPaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {property.sharedPaddocks.total > 0 ? property.sharedPaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Shared
                </span>
              </div>

              {/* Group Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  property.groupPaddocks.total > 0 
                    ? property.groupPaddocks.available > 0
                      ? property.groupPaddocks.whenAvailable && new Date(property.groupPaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {property.groupPaddocks.total > 0 ? property.groupPaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Group
                </span>
              </div>
            </div>
            
            {/* Price Range */}
            <div className="text-right flex flex-col justify-start h-[72px]">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">From</div>
              <div className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                ${Math.min(
                  property.privatePaddocks?.weeklyPrice || Infinity,
                  property.sharedPaddocks?.weeklyPrice || Infinity,
                  property.groupPaddocks?.weeklyPrice || Infinity
                )}/week
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="p-3 sm:p-5 flex-grow bg-white dark:bg-neutral-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[/* eslint-disable @typescript-eslint/no-unused-vars */
              { key: 'arena', label: 'Arena', icon: ArenaIcon, available: property.arenas.length > 0 },
              { key: 'roundYard', label: 'Round Yard', icon: RoundYardIcon, available: property.roundYards.length > 0 },
              { key: 'feedRoom', label: 'Feed Room', icon: FeedRoomIcon, available: property.feedRoom.available },
              { key: 'tackRoom', label: 'Tack Room', icon: TackRoomIcon, available: property.tackRoom.available },
              { key: 'floatParking', label: 'Float', icon: FloatParkingIcon, available: property.floatParking.available },
              { key: 'hotWash', label: 'Hot Wash', icon: HotWashIcon, available: property.hotWash.available },
              { key: 'stables', label: 'Stables', icon: StableIcon, available: property.stables.available },
              { key: 'tieUp', label: 'Tie Up', icon: TieUpIcon, available: property.tieUp.available },
              { 
                key: 'care', 
                label: (() => {
                  const careTypes = [];
                  if (property.fullCare.available) careTypes.push('Full');
                  if (property.partCare.available) careTypes.push('Part');
                  if (property.selfCare.available) careTypes.push('Self');
                  return careTypes.length > 0 ? careTypes.join('/') : 'No Care';
                })(),
                icon: HeartIcon,
                available: property.selfCare.available || property.partCare.available || property.fullCare.available
              }
            ].map(({ key, label, icon: Icon, available }) => (
              <div key={key} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="text-sm flex items-center gap-1">
                  {label}
                  {key !== 'care' && (
                    available ? (
                      <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <CrossIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-primary-50 dark:bg-primary-900/20 border-t border-primary-100 dark:border-primary-800 text-primary-800 dark:text-primary-200">
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm">
              Last updated: {formatDate(property.modifiedAt)}
            </div>
            <div className="flex items-center gap-2">
              {isSignedIn && (
                <button 
                  onClick={handleFavorite}
                  className="inline-flex items-center gap-1 text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                  title="Add to favorites"
                >
                  <FavouriteIcon className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                title="Share this listing"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
