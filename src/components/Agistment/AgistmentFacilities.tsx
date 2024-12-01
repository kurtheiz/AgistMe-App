import { Agistment } from '../../types/agistment';
import {
  FeedRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TackRoomIcon,
  TieUpIcon,
} from '../Icons';

interface AgistmentFacilitiesProps {
  facilities?: Agistment['facilities'];
}

export const AgistmentFacilities: React.FC<AgistmentFacilitiesProps> = ({
  facilities
}) => {
  const facilityItems = [
    { key: 'feedRoom', icon: FeedRoomIcon, label: 'Feed Room' },
    { key: 'floatParking', icon: FloatParkingIcon, label: 'Float Parking' },
    { key: 'hotWash', icon: HotWashIcon, label: 'Hot Wash Bay' },
    { key: 'stables', icon: StableIcon, label: 'Stables' },
    { key: 'tackRoom', icon: TackRoomIcon, label: 'Tack Room' },
    { key: 'tieUp', icon: TieUpIcon, label: 'Tie Ups' }
  ] as const;

  const renderFacilityDetails = (key: keyof Agistment['facilities']) => {
    const facility = facilities?.[key];
    if (!facility?.available) return null;

    const details = [];

    // Type guard to check if facility is Stables
    if (key === 'stables' && 'quantity' in facility && facility.quantity) {
      details.push(`${facility.quantity} ${facility.quantity === 1 ? 'stable' : 'stables'}`);
    }

    if (key === 'floatParking' && 'monthlyPrice' in facility && facility.monthlyPrice) {
      details.push(`$${facility.monthlyPrice}/month`);
    }

    if (facility.comments) {
      details.push(facility.comments);
    }

    return details.length > 0 ? (
      <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
        ({details.join(', ')})
      </span>
    ) : null;
  };

  return (
    <div className="space-y-2">
      {facilityItems.map(({ key, icon: Icon, label }) => {
        const isAvailable = facilities?.[key]?.available;
        
        return (
          <div 
            key={key}
            className={`flex items-center py-1 ${!isAvailable ? 'opacity-50' : ''}`}
          >
            <div className={`w-5 h-5 ${isAvailable ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
              <Icon className="w-full h-full" />
            </div>
            <span className={`ml-2 text-sm ${isAvailable ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
              {label}
            </span>
            {renderFacilityDetails(key)}
          </div>
        );
      })}
    </div>
  );
};
