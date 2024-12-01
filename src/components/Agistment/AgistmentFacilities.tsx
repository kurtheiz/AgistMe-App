import React from 'react';
import { StableIcon, HotWashIcon, FloatParkingIcon, TieUpIcon, FeedRoomIcon, TackRoomIcon } from '../Icons';

interface FacilitiesProps {
  facilities: {
    stables: { available: boolean; quantity: number; comments?: string } | null;
    hotWash: { available: boolean; comments?: string } | null;
    floatParking: { available: boolean; monthlyPrice?: number; comments?: string } | null;
    tieUp: { available: boolean; comments?: string } | null;
    feedRoom: { available: boolean; comments?: string } | null;
    tackRoom: { available: boolean; comments?: string } | null;
  } | null;
  isEditable?: boolean;
  onUpdate?: (updatedFields: Partial<any>) => Promise<void>;
}

export const AgistmentFacilities: React.FC<FacilitiesProps> = ({
  facilities
}) => {
  if (!facilities) return null;

  const facilityItems = [
    { key: 'stables', icon: StableIcon, label: 'Stables' },
    { key: 'hotWash', icon: HotWashIcon, label: 'Wash Bays' },
    { key: 'floatParking', icon: FloatParkingIcon, label: 'Float Parking' },
    { key: 'tieUp', icon: TieUpIcon, label: 'Tie Ups' },
    { key: 'feedRoom', icon: FeedRoomIcon, label: 'Feed Room' },
    { key: 'tackRoom', icon: TackRoomIcon, label: 'Tack Room' }
  ] as const;

  return (
    <div className="space-y-3">
      
      {facilityItems.map(({ key, icon: Icon, label }) => {
        const facility = facilities?.[key];
        const isAvailable = facility?.available;
        
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={isAvailable ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={isAvailable ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}>
                  {label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {key === 'stables' && facility && 'quantity' in facility && facility.quantity > 0 && (
                  <div className="text-neutral-700 dark:text-neutral-300">
                    ({facility.quantity} {facility.quantity === 1 ? 'stable' : 'stables'})
                  </div>
                )}
                {key === 'floatParking' && facility && 'monthlyPrice' in facility && typeof facility.monthlyPrice === 'number' && facility.monthlyPrice > 0 && (
                  <div className="text-neutral-700 dark:text-neutral-300">
                    (${facility.monthlyPrice}/month)
                  </div>
                )}
              </div>
            </div>
            {facility?.comments && (
              <div className="text-sm text-neutral-600 dark:text-neutral-400 pl-7">
                {facility.comments}
              </div>
            )}
          </div>
        );
      })}
      {facilityItems.every(({ key }) => !facilities?.[key]?.available) && (
        <div>
          <div className="inline-flex">
            <div className="font-bold text-red-600 dark:text-red-400">
              No facilities available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
