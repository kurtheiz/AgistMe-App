import { Agistment } from '../../types/agistment';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: Agistment['ridingFacilities'];
  isEditable?: boolean;
  onUpdate?: (updatedFields: Partial<Agistment>) => Promise<void>;
}

export const AgistmentRidingFacilities: React.FC<AgistmentRidingFacilitiesProps> = ({
  ridingFacilities,
}) => {
  return (
    <div>
      <div className="space-y-6">
        {/* Arenas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-medium text-neutral-900">
              Arenas
            </h3>
            <span className="chip-available">
              {ridingFacilities.arenas.length} available
            </span>
          </div>
          <div className="space-y-3">
            
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4">
                {ridingFacilities.arenas.map((arena, index) => (
                  <div key={index}>
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="relative inline-flex flex-col items-center">
                        {/* Width dimension */}
                        <div className="flex items-center w-32 mb-2 ml-5">
                          <div className="w-1 h-3 bg-neutral-300"></div>
                          <div className="flex-1 h-[1px] bg-neutral-300"></div>
                          <span className="text-xs text-neutral-600 absolute left-[55%] -translate-x-1/2 -translate-y-1">
                            {arena.length > 0 ? `${arena.length}m` : ''}
                          </span>
                          <div className="w-1 h-3 bg-neutral-300"></div>
                        </div>
                        <div className="flex items-start">
                          {/* Length dimension */}
                          <div className="flex flex-col items-center h-20 mr-2">
                            <div className="h-1 w-3 bg-neutral-300"></div>
                            <div className="flex-1 w-[1px] bg-neutral-300"></div>
                            <span className="text-xs text-neutral-600 absolute -translate-x-2 top-[60%] -translate-y-1/2 rotate-180 [writing-mode:vertical-lr]">
                              {arena.width > 0 ? `${arena.width}m` : ''}
                            </span>
                            <div className="h-1 w-3 bg-neutral-300"></div>
                          </div>
                          {/* Arena rectangle */}
                          <div className="w-32 h-20 border-2 border-neutral-300 rounded-sm bg-neutral-50"></div>
                        </div>
                      </div>
                      {arena.comments && (
                        <p className="text-neutral-700 text-sm text-center max-w-xs">
                          {arena.comments}
                        </p>
                      )}
                      {arena.features && arena.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {arena.features.map((feature, featureIndex) => (
                            <span
                              key={featureIndex}
                              className="inline-flex bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 rounded-md px-2 py-0.5 text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="chip-unavailable">
                  Unavailable
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Round Yards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-medium text-neutral-900">
              Round Yards
            </h3>
            <span className="chip-available">
              {ridingFacilities.roundYards.length} available
            </span>
          </div>
          <div className="space-y-3">
            
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4">
                {ridingFacilities.roundYards.map((yard, index) => (
                  <div key={index}>
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="flex justify-center">
                        {/* Round yard circle */}
                        <div className="relative w-24 h-24">
                          {/* Circle */}
                          <div className="absolute inset-0 border-2 border-neutral-300 rounded-full bg-neutral-50"></div>
                          {/* Horizontal diameter line */}
                          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-300"></div>
                          {/* Diameter text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-neutral-600 bg-neutral-50 px-1">
                              {yard.diameter > 0 ? `${yard.diameter}m` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      {yard.comments && (
                        <p className="text-neutral-700 text-sm text-center max-w-xs">
                          {yard.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="chip-unavailable">
                  Unavailable
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
