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
import { MapPin, Check, X, Pencil, Image, Heart } from 'lucide-react';
import { AgistmentResponse } from '../types/agistment';
import { getGoogleMapsUrl } from '../utils/location';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeDate } from '../utils/dates';
import { useFavorite } from '../hooks/useFavorite';
import { buildCareOptionsString } from '../utils/careOptions';
import { EditConfirmationModal } from './shared/EditConfirmationModal';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { agistmentService } from '../services/agistment.service';

interface PropertyCardProps {
  agistment: AgistmentResponse;
  onClick?: () => void;
  onEdit?: () => void;
  onToggleVisibility?: () => Promise<void>;
  isUpdatingVisibility?: boolean;
}

export default function PropertyCard({ 
  agistment, 
  onClick, 
  onEdit, 
  onToggleVisibility, 
  isUpdatingVisibility
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { isFavorite, isLoading, toggleFavorite } = useFavorite(agistment);
  const [showEditModal, setShowEditModal] = useState(false);
  
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
      navigate(`/agistments/${agistment.id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className={`relative bg-white border border-neutral-200 rounded-lg overflow-hidden ${
        agistment.status === 'HIDDEN' ? 'opacity-50' : ''
      }`}>
        {/* Visibility Toggle */}
        {onToggleVisibility && (
          <div className="absolute top-2 right-2 z-20">
            <button 
              onClick={onToggleVisibility}
              disabled={isUpdatingVisibility}
              className={`p-1 rounded-full ${
                isUpdatingVisibility 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-neutral-100'
              }`}
            >
              {agistment.status === 'HIDDEN' ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </button>
          </div>
        )}

        {/* Property Name Header */}
        <div className="title-header relative">
          <div className="flex justify-between items-start relative z-10 py-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h2 className="title-text truncate px-2 min-w-0 flex-1">{agistment.basicInfo.name}</h2>
              {agistment.listing.listingType === 'PROFESSIONAL' && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  PRO
                </span>
              )}
            </div>
            <div className="bg-white text-primary-600 text-sm px-2 py-1 mr-2 rounded-md flex-shrink-0">
              {agistment.basicInfo.propertySize} acres
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative aspect-[16/9] bg-neutral-100">
          {agistment.photoGallery.photos && agistment.photoGallery.photos.length > 0 ? (
            <img 
              src={agistment.photoGallery.photos[0].link} 
              alt={`${agistment.basicInfo.name} - ${agistment.photoGallery.photos[0].comment || 'Primary photo'}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-neutral-400 flex flex-col items-center">
                <Image className="w-12 h-12 mb-2" />
                <span className="text-sm">No photos</span>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {agistment.propertyLocation.location && (
          <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-200 bg-white">
            <a
              href={getGoogleMapsUrl(agistment.propertyLocation.location)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-800 hover:text-neutral-700 transition-colors flex-shrink-0"
              title="Open in Google Maps"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div className="flex justify-between items-center min-w-0">
              <div className="text-sm text-neutral-800 truncate">
                {agistment.propertyLocation.location.address}, {agistment.propertyLocation.location.suburb}, {agistment.propertyLocation.location.region}, {agistment.propertyLocation.location.state}
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
                        ? agistment.paddocks?.privatePaddocks?.whenAvailable && new Date(agistment.paddocks?.privatePaddocks?.whenAvailable) > new Date()
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.privatePaddocks?.totalPaddocks > 0 ? agistment.paddocks?.privatePaddocks?.available : '-'}
                  </span>
                  <span className="text-sm sm:text-base text-neutral-600 font-medium mt-2">
                    Private
                  </span>
                </div>

                {/* Shared Paddocks */}
                <div className="flex flex-col items-center">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.sharedPaddocks?.available > 0
                        ? agistment.paddocks?.sharedPaddocks?.whenAvailable && new Date(agistment.paddocks?.sharedPaddocks?.whenAvailable) > new Date()
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.sharedPaddocks?.totalPaddocks > 0 ? agistment.paddocks?.sharedPaddocks?.available : '-'}
                  </span>
                  <span className="text-sm sm:text-base text-neutral-600 font-medium mt-2">
                    Shared
                  </span>
                </div>

                {/* Group Paddocks */}
                <div className="flex flex-col items-center">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    agistment.paddocks?.groupPaddocks?.totalPaddocks > 0 
                      ? agistment.paddocks?.groupPaddocks?.available > 0
                        ? agistment.paddocks?.groupPaddocks?.whenAvailable && new Date(agistment.paddocks?.groupPaddocks?.whenAvailable) > new Date()
                          ? 'bg-amber-100 text-amber-700 px-3 py-1.5'
                          : 'bg-primary-100 text-primary-700 px-3 py-1.5'
                        : 'bg-red-100 text-red-600 px-3 py-1.5'
                      : 'border-2 border-dotted border-neutral-300 text-neutral-300 px-[10px] py-[4px]'
                  } rounded-lg`}>
                    {agistment.paddocks?.groupPaddocks?.totalPaddocks > 0 ? agistment.paddocks?.groupPaddocks?.available : '-'}
                  </span>
                  <span className="text-sm sm:text-base text-neutral-600 font-medium mt-2">
                    Group
                  </span>
                </div>
              </div>
            </div>
          

            {/* Price Range */}
            <div className="text-right flex flex-col justify-start h-[72px]">
              <div className="font-bold text-lg text-neutral-900">
                {(() => {
                  const prices = [
                    agistment.paddocks?.privatePaddocks?.weeklyPrice,
                    agistment.paddocks?.sharedPaddocks?.weeklyPrice,
                    agistment.paddocks?.groupPaddocks?.weeklyPrice
                  ].filter(price => price !== undefined && price !== null);

                  // If all prices are 0 or no prices available
                  if (prices.length === 0 || prices.every(price => price === 0)) {
                    return 'Price on Application';
                  }

                  // Filter out 0 prices for min/max calculation
                  const nonZeroPrices = prices.filter(price => price > 0);
                  const minPrice = Math.min(...nonZeroPrices);
                  const maxPrice = Math.max(...nonZeroPrices);

                  return minPrice === maxPrice 
                    ? `From $${formatCurrency(minPrice)}`
                    : `$${formatCurrency(minPrice)} - $${formatCurrency(maxPrice)}`;
                })()}
                {(() => {
                  const allPrices = [
                    agistment.paddocks?.privatePaddocks?.weeklyPrice,
                    agistment.paddocks?.sharedPaddocks?.weeklyPrice,
                    agistment.paddocks?.groupPaddocks?.weeklyPrice
                  ].filter(price => price !== undefined && price !== null);

                  if (allPrices.length > 0 && !allPrices.every(price => price === 0)) {
                    return <span className="text-sm font-normal text-neutral-500 ml-1">/week</span>;
                  }
                  return null;
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
                label: `${buildCareOptionsString(agistment.care)} Care`, 
                icon: null, 
                available: true 
              },
            ].map(({ key, label, icon: Icon, available }) => (
              <div key={key} className="flex items-center gap-2 text-neutral-600">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="text-sm flex items-center gap-1">
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
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite();
              }}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-neutral-600'}`} />
            </button>

            {/* Edit Button */}
            {onEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (agistment.status === 'HIDDEN') {
                      // If already hidden, go straight to edit
                      onEdit();
                    } else {
                      // If not hidden, show the confirmation modal
                      setShowEditModal(true);
                    }
                  }}
                  className="button-toolbar"
                  title="Edit property"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {agistment.status === 'HIDDEN' && (
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700">
                    HIDDEN
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-xs sm:text-sm">
            Last updated: {formatRelativeDate(agistment.modifiedAt)}
          </div>
        </div>
      </div>
      {/* Edit Confirmation Modal */}
      <EditConfirmationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={async (hideAgistment) => {
          if (hideAgistment && agistment.status !== 'HIDDEN') {
            try {
              // Directly update the agistment to hidden status
              const updatedAgistment: Partial<AgistmentResponse> = {
                ...agistment,
                status: 'HIDDEN'
              };
              await agistmentService.updateAgistment(agistment.id, updatedAgistment);
              
              // Notify parent component that visibility changed
              if (onToggleVisibility) {
                await onToggleVisibility();
              }
            } catch (error) {
              console.error('Failed to hide agistment:', error);
              toast.error('Failed to hide agistment');
              return;
            }
          }
          setShowEditModal(false);
          onEdit?.();
        }}
        currentlyHidden={agistment.status === 'HIDDEN'}
        isUpdating={isUpdatingVisibility}
      />
    </div>
  );
}
