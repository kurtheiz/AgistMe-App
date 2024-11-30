import { Pencil } from 'lucide-react';
import { Agistment } from '../../types/agistment';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: Agistment['ridingFacilities'];
  isEditable?: boolean;
}

export const AgistmentRidingFacilities: React.FC<AgistmentRidingFacilitiesProps> = ({
  ridingFacilities,
  isEditable = false
}) => {
  return (
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h3 className="agistment-section-title">Riding Facilities</h3>
        {isEditable && (
          <button className="btn-edit">
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Arenas */}
        <div className="border-title-card">
          <span className="border-title-card-title">
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 1 ? `${ridingFacilities.arenas.length} Arenas` : 'Arena'}
          </span>
          <div className="border-title-card-content">
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
              <div className="w-full">
                {ridingFacilities.arenas.map((arena, index) => (
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
            ) : (
              <span className="chip-unavailable">Unavailable</span>
            )}
          </div>
        </div>

        {/* Round Yards */}
        <div className="border-title-card">
          <span className="border-title-card-title">
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 1 ? `${ridingFacilities.roundYards.length} Round Yards` : 'Round Yard'}
          </span>
          <div className="border-title-card-content">
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
              <div className="w-full">
                {ridingFacilities.roundYards.map((yard, index) => (
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
            ) : (
              <span className="chip-unavailable">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
