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
          <div className="space-y-3">
            <p>
              This property has {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
                <span>
                  {ridingFacilities.arenas.length} {ridingFacilities.arenas.length === 1 ? 'arena' : 'arenas'}
                </span>
              ) : 'no arenas'}.
            </p>
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
              <div className="space-y-4">
                {ridingFacilities.arenas.map((arena, index) => (
                  <div key={index}>
                    <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2">
                      <div>
                        {arena.length}m × {arena.width}m
                      </div>
                    </div>
                    {arena.comments && (
                      <p className="mt-2">
                        {arena.comments}
                      </p>
                    )}
                    {arena.features && arena.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {arena.features.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
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
              <div>
                <div className="inline-flex rounded-lg px-3 py-2">
                  <div>
                    No arenas available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Round Yards */}
        <div>
         
          <div className="space-y-3">
            <p>
              This property has {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
                <span>
                  {ridingFacilities.roundYards.length} {ridingFacilities.roundYards.length === 1 ? 'round yard' : 'round yards'}
                </span>
              ) : 'no round yards'}.
            </p>
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
              <div className="space-y-4">
                {ridingFacilities.roundYards.map((yard, index) => (
                  <div key={index}>
                    <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2">
                      <div>
                        {yard.diameter}m diameter
                      </div>
                    </div>
                    {yard.comments && (
                      <p className="mt-2">
                        {yard.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="inline-flex rounded-lg px-3 py-2">
                  <div>
                    No round yards available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
