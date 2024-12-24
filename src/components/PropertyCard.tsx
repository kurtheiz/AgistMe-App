import { useNavigate } from 'react-router-dom';
import { 
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
} from './Icons';
import { Check, X, HandHeart, Heart } from 'lucide-react';
import { AgistmentResponse } from '../types/agistment';
import { formatCurrency } from '../utils/prices';
import { formatRelativeDate } from '../utils/dates';
import { useFavorite } from '../hooks/useFavorite';
import { buildCareOptionsString } from '../utils/careOptions';
import { AgistmentPhotosView } from './Agistment/AgistmentPhotosView';
import { PriceUtils } from '../utils/prices';

interface PropertyCardProps {
  agistment: AgistmentResponse;
  onClick?: () => void;
  searchCriteria?: {
    paddockTypes?: ('Private' | 'Shared' | 'Group')[];
  };
  noShadow?: boolean;
  disableClick?: boolean;
  disableFavorite?: boolean;
  showStatus?: boolean;
}

const PropertyCard = ({ 
  agistment, 
  onClick, 
  searchCriteria,
  noShadow,
  disableClick,
  disableFavorite
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorite(agistment);

  const isDateInFuture = (date: string | null | undefined) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate > today;
  };

  // If agistment is not loaded yet, show loading state
  if (!agistment || !agistment.basicInfo) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-4 animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
        <div className="h-48 bg-neutral-200 rounded mb-4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if the click was on a button or link
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      const currentScroll = window.scrollY;
      console.log('Saving scroll position:', currentScroll);
      sessionStorage.setItem('scrollPosition', currentScroll.toString());
      navigate(`/agistments/${agistment.id}`);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg ${noShadow ? '' : 'shadow-xl hover:shadow-2xl'} transition-shadow duration-300 ${!disableClick ? 'cursor-pointer' : ''} ${agistment.status === 'HIDDEN' ? 'grayscale' : ''}`}
      onClick={!disableClick ? handleClick : undefined}
    >
      <div className="relative bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {/* Property Name Header */}
        <div className="title-header relative">
          <div className="flex justify-between items-start relative z-10 py-1">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <h2 className="title-text truncate px-1.5 min-w-0 flex-1 font-medium">{agistment.basicInfo.name}</h2>
              
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9">
            <AgistmentPhotosView 
              photos={agistment.photoGallery?.photos}
            />
            {agistment.status === 'HIDDEN' && (
              <div className="absolute inset-0 bg-white/30" />
            )}
          </div>
        </div>

        {/* Location */}
        {agistment.propertyLocation.location && (
          <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-200 bg-white">
            <div className="flex flex-col min-w-0">
              <div className="text-neutral-800 truncate">
              {agistment.propertyLocation.location.address && (
    <><span className="font-semibold">{agistment.propertyLocation.location.address}</span>, </>
  )}<span className="font-semibold">{agistment.propertyLocation.location.suburb}</span>, <span className="font-semibold">{agistment.propertyLocation.location.region}</span>, <span className="font-semibold">{agistment.propertyLocation.location.state}</span>
              </div>
              {agistment.matchType === 'ADJACENT' && agistment.distance !== undefined && (
                <div className="text-xs text-neutral-500 mt-1">
                  <span className="font-semibold">{agistment.propertyLocation.location.suburb}</span> is <span className="font-semibold">{agistment.distance.toFixed(1)}km</span> away from <span className="font-semibold">{agistment.distanceFrom}</span>
                </div>
              )}
              {agistment.matchType === 'EXACT' && (
                <div className="text-xs text-neutral-500 mt-1">
                   Exact location match
                </div>
              )}
              <div className="text-xs text-neutral-500 mt-1">
                {agistment.basicInfo.propertySize && agistment.basicInfo.propertySize > 0 
                  ? <>Property is <span className="font-bold">{agistment.basicInfo.propertySize}</span> acres</>
                  : 'Property size not specified'
                }
              </div>
            </div>
          </div>
        )}

        {/* Availability Info */}
        <div className="px-5 py-3 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-left text-base sm:text-lg font-semibold text-neutral-800 mb-3">
                Spots Available
              </h3>
              <div className="flex items-center gap-4 sm:gap-8">
                {/* Private Paddocks */}
                <div className="flex flex-col items-center">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.privatePaddocks?.available > 0
                        ? agistment.paddocks?.privatePaddocks?.whenAvailable && isDateInFuture(agistment.paddocks?.privatePaddocks?.whenAvailable)
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 ? agistment.paddocks?.privatePaddocks?.available : '-'}

                  </span>
                  <span className="text-neutral-600 font-medium mt-2">
                    Private
                  </span>
                  <span className="text-xs font-bold text-neutral-600 mt-1 h-4 flex items-center gap-1">
                    {agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.privatePaddocks?.weeklyPrice !== undefined 
                        ? agistment.paddocks.privatePaddocks.weeklyPrice === 0 
                          ? 'Contact'
                          : <><span>${formatCurrency(agistment.paddocks.privatePaddocks.weeklyPrice)}</span><span className="font-normal text-neutral-400 -ml-[1px]">/week</span></>
                        : null
                      : null}
                  </span>
                </div>

                {/* Shared Paddocks */}
                <div className="flex flex-col items-center">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.sharedPaddocks?.available > 0
                        ? agistment.paddocks?.sharedPaddocks?.whenAvailable && isDateInFuture(agistment.paddocks?.sharedPaddocks?.whenAvailable)
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 ? agistment.paddocks?.sharedPaddocks?.available : '-'}

                  </span>
                  <span className="text-neutral-600 font-medium mt-2">
                    Shared
                  </span>
                  <span className="text-xs font-bold text-neutral-600 mt-1 h-4 flex items-center gap-1">
                    {agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.sharedPaddocks?.weeklyPrice !== undefined 
                        ? agistment.paddocks.sharedPaddocks.weeklyPrice === 0 
                          ? 'Contact'
                          : <><span>${formatCurrency(agistment.paddocks.sharedPaddocks.weeklyPrice)}</span><span className="font-normal text-neutral-400 -ml-[1px]">/week</span></>
                        : null
                      : null}
                  </span>
                </div>

                {/* Group Paddocks */}
                <div className="flex flex-col items-center">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    agistment.paddocks?.groupPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.groupPaddocks?.available > 0
                        ? agistment.paddocks?.groupPaddocks?.whenAvailable && isDateInFuture(agistment.paddocks?.groupPaddocks?.whenAvailable)
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.groupPaddocks?.totalPaddocks > 0 ? agistment.paddocks?.groupPaddocks?.available : '-'}

                  </span>
                  <span className="text-neutral-600 font-medium mt-2">
                    Group
                  </span>
                  <span className="text-xs font-bold text-neutral-600 mt-1 h-4 flex items-center gap-1">
                    {agistment.paddocks?.groupPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.groupPaddocks?.weeklyPrice !== undefined 
                        ? agistment.paddocks.groupPaddocks.weeklyPrice === 0 
                          ? 'Contact'
                          : <><span>${formatCurrency(agistment.paddocks.groupPaddocks.weeklyPrice)}</span><span className="font-normal text-neutral-400 -ml-[1px]">/week</span></>
                        : null
                      : null}
                  </span>
                </div>
              </div>
            </div>
          

            {/* Price Range */}
            <div className="text-right flex flex-col justify-start h-[72px]">
              <div className="font-bold text-xl text-neutral-900 flex flex-col items-end">
                {(() => {
                  const { price, subtext } = PriceUtils.getPriceDisplay(agistment, searchCriteria);
                  return (
                    <>{price && <span>{price}</span>}
                      {subtext && <span className="font-normal text-neutral-400 text-xs">{subtext}</span>}</>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="p-3 sm:p-5 flex-grow bg-white">
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
                key: 'careOptions', 
                label: buildCareOptionsString(agistment.care), 
                icon: HandHeart, 
                available: true 
              },
            ].map(({ key, label, icon: Icon, available }) => (
              <div key={key} className="flex items-center gap-2 text-neutral-600">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="flex items-center gap-1">
                  {label}
                  {key !== 'careOptions' && (
                    available ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-4 py-3 bg-primary-50 border-t border-primary-100 text-primary-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                if (!disableFavorite) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite();
                }
              }}
              className={`p-2 rounded-md transition-colors duration-200 ${
                disableFavorite ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-50'
              }`}
              disabled={!!disableFavorite}
              title="Add to favorites"
            >
              <Heart className={`w-5 h-5 stroke-neutral-600 ${isFavorite ? 'fill-red-600' : ''}`} />
            </button>
          </div>
          <div className="text-xs sm:text-sm">
            Last updated: {formatRelativeDate(agistment.modifiedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export { PropertyCard };
export default PropertyCard;
