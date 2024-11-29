import { EditIcon } from '../../components/Icons';
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
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Riding Facilities</h3>
        {isEditable && (
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Arenas */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 1 ? `${ridingFacilities.arenas.length} Arenas` : 'Arena'}
          </span>
          <div className="flex flex-col items-center pt-2">
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
            ) : !ridingFacilities.arenas ? (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                None Available
              </span>
            ) : (
              <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg">
                Available
              </span>
            )}
          </div>
        </div>

        {/* Round Yards */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 1 ? `${ridingFacilities.roundYards.length} Round Yards` : 'Round Yard'}
          </span>
          <div className="flex flex-col items-center pt-2">
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
            ) : !ridingFacilities.roundYards ? (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                None Available
              </span>
            ) : (
              <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg">
                Available
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
