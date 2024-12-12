import { AgistmentResponse, Arena, RoundYard } from '../../types/agistment';
import { ArenaDiagram } from './ArenaDiagram';
import { RoundYardDiagram } from './RoundYardDiagram';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: AgistmentResponse['ridingFacilities'];
}

export const AgistmentRidingFacilities: React.FC<AgistmentRidingFacilitiesProps> = ({
  ridingFacilities,
}) => {
  return (
    <div>
      <div className="space-y-6">
        {/* Arenas */}
        <div className="border border-neutral-200 rounded-lg p-4 relative mt-4">
          <div className="absolute -top-3 left-3 bg-white px-2">
            <h3 className="text-lg font-medium text-neutral-900">
              Arenas
            </h3>
          </div>
          <div className="mt-2">
            {(!ridingFacilities.arenas || ridingFacilities.arenas.length === 0) && (
              <div className="chip-unavailable">
                <div>
                  Unavailable
                </div>
              </div>
            )}
            <div className="space-y-3">
              {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
                <div className={`grid ${ridingFacilities.arenas.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-8 sm:gap-4 items-start`}>
                  {ridingFacilities.arenas.map((arena: Arena, index: number) => (
                    <div key={index}>
                      <div className="space-y-3 flex flex-col items-center">
                        <ArenaDiagram length={arena.length} width={arena.width} />
                        <p className="text-neutral-700 text-sm text-center max-w-xs min-h-[1.5rem]">
                          {arena.comments || '\u00A0'}
                        </p>
                        {arena.features && arena.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {arena.features.map((feature: string, featureIndex: number) => (
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
              ) : null}
            </div>
          </div>
        </div>

        {/* Round Yards */}
        <div className="border border-neutral-200 rounded-lg p-4 relative mt-4">
          <div className="absolute -top-3 left-3 bg-white px-2">
            <h3 className="text-lg font-medium text-neutral-900">
              Round Yards
            </h3>
          </div>
          <div className="mt-2">
            {(!ridingFacilities.roundYards || ridingFacilities.roundYards.length === 0) && (
              <div className="chip-unavailable">
                <div>
                  Unavailable
                </div>
              </div>
            )}
            <div className="space-y-3">
              {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
                <div className={`grid ${ridingFacilities.roundYards.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-8 sm:gap-4 items-start`}>
                  {ridingFacilities.roundYards.map((yard: RoundYard, index: number) => (
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
              ) : null}
            </div>
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
