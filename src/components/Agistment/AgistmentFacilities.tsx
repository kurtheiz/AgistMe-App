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
}

export const AgistmentFacilities: React.FC<FacilitiesProps> = ({
  facilities
}) => {
  if (!facilities) return null;

  const facilityItems = [
    { key: 'feedRoom', icon: FeedRoomIcon, label: 'Feed Room' },
    { key: 'floatParking', icon: FloatParkingIcon, label: 'Float Parking' },
    { key: 'hotWash', icon: HotWashIcon, label: 'Hot Wash' },
    { key: 'stables', icon: StableIcon, label: 'Stables' },
    { key: 'tackRoom', icon: TackRoomIcon, label: 'Tack Room' },
    { key: 'tieUp', icon: TieUpIcon, label: 'Tie Ups' }
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
                <div className={isAvailable ? "text-primary-600" : "text-neutral-400"}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={isAvailable ? "font-medium text-neutral-900" : "text-neutral-500"}>
                  {label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isAvailable && (
                  <div className="chip-unavailable">
                    Unavailable
                  </div>
                )}
                {isAvailable && key === 'stables' && 'quantity' in facility && (
                  <div className="text-neutral-700">
                    {facility.quantity}
                  </div>
                )}
                {isAvailable && key === 'floatParking' && 'monthlyPrice' in facility && facility.monthlyPrice !== undefined && (
                  <div className="text-neutral-700">
                    (<b>${facility.monthlyPrice}</b> per month)
                  </div>
                )}
              </div>
            </div>
            {facility?.comments && (
              <div className="text-sm text-neutral-600 pl-7">
                {facility.comments}
              </div>
            )}
          </div>
        );
      })}
      {facilityItems.every(({ key }) => !facilities?.[key]?.available) && (
        <div>
          <div className="inline-flex">
            <div className="chip-unavailable">
              Unavailable
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
