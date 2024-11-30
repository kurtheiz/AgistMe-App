import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MapPinIcon, 
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
  PhotoIcon,
  HeartIcon,
  CheckIcon,
  CrossIcon,
} from './Icons';
import { Agistment } from '../types/agistment';
import { useUser } from '@clerk/clerk-react';
import { getGoogleMapsUrl } from '../utils/location';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeDate } from '../utils/dates';
import { ShareFavoriteButtons } from './shared/ShareFavoriteButtons';

interface PropertyCardProps {
  agistment: Agistment;
  onClick?: () => void;
}

export default function PropertyCard({ agistment, onClick }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleClick = (_: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/agistments/${agistment.id}`);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        {/* Property Name Header */}
        <div className="title-header relative">
          <div className="flex justify-between items-start relative z-10 py-2">
            <div className="flex items-center gap-2">
              <h2 className="title-text dark:text-neutral-200 truncate px-2">{agistment.basicInfo.name}</h2>
              {agistment.listing.listingType === 'PROFESSIONAL' && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  PRO
                </span>
              )}
            </div>
            <div className="bg-white text-primary-600 text-sm px-2 py-1 mr-2 rounded-md dark:bg-primary-400 dark:text-neutral-200">
              {agistment.basicInfo.propertySize} acres
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-700">
          {agistment.photoGallery.photos && agistment.photoGallery.photos.length > 0 ? (
            <img 
              src={agistment.photoGallery.photos[0].link} 
              alt={`${agistment.basicInfo.name} - ${agistment.photoGallery.photos[0].comment || 'Primary photo'}`}
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
        {agistment.propertyLocation.location && (
          <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700">
            <a
              href={getGoogleMapsUrl(agistment.propertyLocation.location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-800 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
              title="Open in Google Maps"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div className="flex justify-between items-center">
              <div className="text-sm text-neutral-800 dark:text-neutral-400">
                {agistment.propertyLocation.location.address}, {agistment.propertyLocation.location.suburb}, {agistment.propertyLocation.location.region}, {agistment.propertyLocation.location.state}
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
                  agistment.paddocks?.privatePaddocks?.total > 0 
                    ? agistment.paddocks?.privatePaddocks?.available > 0
                      ? agistment.paddocks?.privatePaddocks?.whenAvailable && new Date(agistment.paddocks?.privatePaddocks?.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.paddocks?.privatePaddocks?.total > 0 ? agistment.paddocks?.privatePaddocks?.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Private
                </span>
              </div>

              {/* Shared Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  agistment.paddocks?.sharedPaddocks?.total > 0 
                    ? agistment.paddocks?.sharedPaddocks?.available > 0
                      ? agistment.paddocks?.sharedPaddocks?.whenAvailable && new Date(agistment.paddocks?.sharedPaddocks?.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.paddocks?.sharedPaddocks?.total > 0 ? agistment.paddocks?.sharedPaddocks?.available : '-'}
                </span>
                <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium mt-2">
                  Shared
                </span>
              </div>

              {/* Group Paddocks */}
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold ${
                  agistment.paddocks?.groupPaddocks?.total > 0 
                    ? agistment.paddocks?.groupPaddocks?.available > 0
                      ? agistment.paddocks?.groupPaddocks?.whenAvailable && new Date(agistment.paddocks?.groupPaddocks?.whenAvailable) > new Date()
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5'
                        : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5'
                    : 'border-2 border-dotted border-neutral-300 dark:border-neutral-600 text-neutral-300 dark:text-neutral-600 px-[10px] py-[4px]'
                } rounded-lg`}>
                  {agistment.paddocks?.groupPaddocks?.total > 0 ? agistment.paddocks?.groupPaddocks?.available : '-'}
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
                  agistment.paddocks?.privatePaddocks?.weeklyPrice || Infinity,
                  agistment.paddocks?.sharedPaddocks?.weeklyPrice || Infinity,
                  agistment.paddocks?.groupPaddocks?.weeklyPrice || Infinity
                ))}/week
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="p-3 sm:p-5 flex-grow bg-white dark:bg-neutral-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[/* eslint-disable @typescript-eslint/no-unused-vars */
              { 
                key: 'arena', 
                label: 'Arena', 
                icon: ArenaIcon, 
                available: agistment.ridingFacilities.arenas.length > 0 
              },
              { 
                key: 'roundYard', 
                label: 'Round Yard', 
                icon: RoundYardIcon, 
                available: agistment.ridingFacilities.roundYards.length > 0 
              },
              { key: 'feedRoom', label: 'Feed Room', icon: FeedRoomIcon, available: agistment.facilities.feedRoom.available },
              { key: 'tackRoom', label: 'Tack Room', icon: TackRoomIcon, available: agistment.facilities.tackRoom.available },
              { key: 'floatParking', label: 'Float', icon: FloatParkingIcon, available: agistment.facilities.floatParking.available },
              { key: 'hotWash', label: 'Hot Wash', icon: HotWashIcon, available: agistment.facilities.hotWash.available },
              { key: 'stables', label: 'Stables', icon: StableIcon, available: agistment.facilities.stables.available },
              { key: 'tieUp', label: 'Tie Up', icon: TieUpIcon, available: agistment.facilities.tieUp.available },
              { 
                key: 'care', 
                label: (() => {
                  const careTypes = [];
                  if (agistment.care.fullCare.available) careTypes.push('Full');
                  if (agistment.care.partCare.available) careTypes.push('Part');
                  if (agistment.care.selfCare.available) careTypes.push('Self');
                  return careTypes.length > 0 ? careTypes.join('/') : 'No Care';
                })(),
                icon: HeartIcon,
                available: agistment.care.selfCare.available || agistment.care.partCare.available || agistment.care.fullCare.available
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
            <ShareFavoriteButtons 
              agistmentId={agistment.id}
              shareDescription={`Check out this agistment ${agistment.basicInfo.name} in ${agistment.propertyLocation.location.suburb}, ${agistment.propertyLocation.location.region}, ${agistment.propertyLocation.location.state}`}
            />
            <div className="text-xs sm:text-sm">
              Last updated: {formatRelativeDate(agistment.modifiedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
