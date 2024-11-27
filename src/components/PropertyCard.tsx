import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MapPinIcon, 
  ShareIcon, 
  CheckIcon,
  CrossIcon,
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
  HeartIcon,
  PhotoIcon
} from './Icons';
import { Agistment } from '../types/agistment';
import { useUser } from '@clerk/clerk-react';
import { getGoogleMapsUrl } from '../utils/location';
import { formatCurrency } from '../utils/formatCurrency';

interface PropertyCardProps {
  agistment: Agistment;
  onClick?: () => void;
}

export default function PropertyCard({ agistment, onClick }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const handleClick = (_: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/agistments/${agistment.id}`);
    }
  };

  const handleShare = async (_: React.MouseEvent) => {
    const shareUrl = `${window.location.origin}/agistments/${agistment.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${agistment.name} on AgistMe`,
          text: `Check out this agistment ${agistment.name} in ${agistment.location.suburb}, ${agistment.location.region}, ${agistment.location.state}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (_) {
      console.error('Error sharing:');
      toast.error('Failed to share');
    }
  };

  return (
    <div 
      className="relative w-full cursor-pointer" 
      onClick={handleClick}
    >
      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        {/* Property Name Header */}
        <div className="title-header">
          <div className="flex justify-between items-start">
            
            <h2 className="title-text dark:text-neutral-200 truncate px-2">{agistment.name}</h2>
            <div className="text-white text-sm px-2 py-1 bg-primary-600 rounded-md dark:bg-primary-400 dark:text-neutral-200">
              {agistment.propertySize} acres
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-700">
          {agistment.photos && agistment.photos.length > 0 ? (
            <img 
              src={agistment.photos[0].link} 
              alt={`${agistment.name} - ${agistment.photos[0].comment || 'Primary photo'}`}
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

        {/* Location */}
        {agistment.location && (
          <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700">
            <a
              href={getGoogleMapsUrl(agistment.location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
              title="Open in Google Maps"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div className="flex justify-between items-center">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {agistment.location.address}, {agistment.location.suburb}, {agistment.location.region}, {agistment.location.state}
              </div>
            </div>
          </div>
        )}

        {/* Availability Info */}
        <div className="px-5 py-3 bg-white dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Private Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  agistment.privatePaddocks.total > 0 
                    ? agistment.privatePaddocks.available > 0
                      ? agistment.privatePaddocks.whenAvailable && new Date(agistment.privatePaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.privatePaddocks.total > 0 ? agistment.privatePaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Private
                </span>
              </div>

              {/* Shared Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  agistment.sharedPaddocks.total > 0 
                    ? agistment.sharedPaddocks.available > 0
                      ? agistment.sharedPaddocks.whenAvailable && new Date(agistment.sharedPaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.sharedPaddocks.total > 0 ? agistment.sharedPaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Shared
                </span>
              </div>

              {/* Group Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  agistment.groupPaddocks.total > 0 
                    ? agistment.groupPaddocks.available > 0
                      ? agistment.groupPaddocks.whenAvailable && new Date(agistment.groupPaddocks.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.groupPaddocks.total > 0 ? agistment.groupPaddocks.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Group
                </span>
              </div>
            </div>
            
            {/* Paddock Types */}
            <div className="flex flex-wrap gap-2 mt-4">
              {agistment.paddockTypes?.map((type: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Price Range */}
            <div className="text-right flex flex-col justify-start h-[72px]">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">From</div>
              <div className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                ${formatCurrency(Math.min(
                  agistment.privatePaddocks?.weeklyPrice || Infinity,
                  agistment.sharedPaddocks?.weeklyPrice || Infinity,
                  agistment.groupPaddocks?.weeklyPrice || Infinity
                ))}/week
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="p-3 sm:p-5 flex-grow bg-white dark:bg-neutral-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[/* eslint-disable @typescript-eslint/no-unused-vars */
              { key: 'arena', label: 'Arena', icon: ArenaIcon, available: agistment.arenas.length > 0 },
              { key: 'roundYard', label: 'Round Yard', icon: RoundYardIcon, available: agistment.roundYards.length > 0 },
              { key: 'feedRoom', label: 'Feed Room', icon: FeedRoomIcon, available: agistment.feedRoom.available },
              { key: 'tackRoom', label: 'Tack Room', icon: TackRoomIcon, available: agistment.tackRoom.available },
              { key: 'floatParking', label: 'Float', icon: FloatParkingIcon, available: agistment.floatParking.available },
              { key: 'hotWash', label: 'Hot Wash', icon: HotWashIcon, available: agistment.hotWash.available },
              { key: 'stables', label: 'Stables', icon: StableIcon, available: agistment.stables.available },
              { key: 'tieUp', label: 'Tie Up', icon: TieUpIcon, available: agistment.tieUp.available },
              { 
                key: 'care', 
                label: (() => {
                  const careTypes = [];
                  if (agistment.fullCare.available) careTypes.push('Full');
                  if (agistment.partCare.available) careTypes.push('Part');
                  if (agistment.selfCare.available) careTypes.push('Self');
                  return careTypes.length > 0 ? careTypes.join('/') : 'No Care';
                })(),
                icon: HeartIcon,
                available: agistment.selfCare.available || agistment.partCare.available || agistment.fullCare.available
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
            <div className="flex items-center gap-2">
              {isSignedIn && (
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                  title="Share this listing"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="text-xs sm:text-sm">
              Last updated: {formatDate(agistment.modifiedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
