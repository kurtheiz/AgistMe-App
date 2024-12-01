import { Pencil } from 'lucide-react';
import { Agistment } from '../../types/agistment';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: Agistment['ridingFacilities'];
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentRidingFacilities: React.FC<AgistmentRidingFacilitiesProps> = ({
  ridingFacilities,
  isEditable = false
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Riding Facilities
        </h3>
        {isEditable && (
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Arenas */}
        <div>
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 1 
              ? `${ridingFacilities.arenas.length} Arenas` 
              : 'Arena'}
          </h4>
          {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
            <div className="space-y-4">
              {ridingFacilities.arenas.map((arena, index) => (
                <div 
                  key={index} 
                  className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4"
                >
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {arena.length}m × {arena.width}m
                  </div>
                  {arena.comments && (
                    <p className="text-neutral-700 dark:text-neutral-300 mt-2">
                      {arena.comments}
                    </p>
                  )}
                  {arena.features && arena.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {arena.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
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
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
              <span className="text-neutral-600 dark:text-neutral-400">
                No arenas available
              </span>
            </div>
          )}
        </div>

        {/* Round Yards */}
        <div>
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 1 
              ? `${ridingFacilities.roundYards.length} Round Yards` 
              : 'Round Yard'}
          </h4>
          {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
            <div className="space-y-4">
              {ridingFacilities.roundYards.map((yard, index) => (
                <div 
                  key={index} 
                  className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4"
                >
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {yard.diameter}m diameter
                  </div>
                  {yard.comments && (
                    <p className="text-neutral-700 dark:text-neutral-300 mt-2">
                      {yard.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
              <span className="text-neutral-600 dark:text-neutral-400">
                No round yards available
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
