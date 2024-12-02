import { Agistment } from '../../types/agistment';
import { ArenaDiagram } from './ArenaDiagram';
import { RoundYardDiagram } from './RoundYardDiagram';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: Agistment['ridingFacilities'];
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
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 && (
              <span className="chip-available">
                {ridingFacilities.arenas.length} available
              </span>
            )}
          </div>
          <div className="space-y-3">
            
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
              <div className={`grid ${ridingFacilities.arenas.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-8 sm:gap-4 items-end`}>
                {ridingFacilities.arenas.map((arena, index) => (
                  <div key={index}>
                    <div className="space-y-3 flex flex-col items-center">
                      <ArenaDiagram length={arena.length} width={arena.width} />
                      <p className="text-neutral-700 text-sm text-center max-w-xs min-h-[1.5rem]">
                        {arena.comments || '\u00A0'}
                      </p>
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
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 && (
              <span className="chip-available">
                {ridingFacilities.roundYards.length} available
              </span>
            )}
          </div>
          <div className="space-y-3">
            
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
              <div className={`grid ${ridingFacilities.roundYards.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-8 sm:gap-4 items-end`}>
                {ridingFacilities.roundYards.map((yard, index) => (
                  <div key={index}>
                    <div className="space-y-3 flex flex-col items-center">
                      <RoundYardDiagram diameter={yard.diameter} />
                      <p className="text-neutral-700 text-sm text-center max-w-xs min-h-[1.5rem]">
                        {yard.comments || '\u00A0'}
                      </p>
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
      {(ridingFacilities.arenas.length > 0 || ridingFacilities.roundYards.length > 0) && (
        <p className="text-xs text-neutral-500 mt-4 text-center italic">
          * Diagrams are indicative only and not to scale
        </p>
      )}
    </div>
  );
};
