import { Agistment } from '../../types/agistment';

interface AgistmentRidingFacilitiesProps {
  ridingFacilities: Agistment['ridingFacilities'];
  isEditable?: boolean;
  onUpdate?: (updatedFields: Partial<Agistment>) => Promise<void>;
}

const RectangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const AgistmentRidingFacilities: React.FC<AgistmentRidingFacilitiesProps> = ({
  ridingFacilities,
}) => {
  return (
    <div>
      <div className="space-y-6">
        {/* Arenas */}
        <div>
          <h3 className="text-base font-medium text-neutral-900 mb-3 flex items-center gap-2">
            <span className="text-neutral-600"><RectangleIcon /></span>
            Arenas
          </h3>
          <div className="space-y-3">
           
            {ridingFacilities.arenas && ridingFacilities.arenas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ridingFacilities.arenas.map((arena, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <div className="space-y-3">
                      <div className="inline-flex bg-primary-50 rounded-lg px-3 py-2 text-primary-600">
                        {arena.length}m × {arena.width}m
                      </div>
                      {arena.features && arena.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {arena.features.map((feature, featureIndex) => (
                            <span
                              key={featureIndex}
                              className="inline-flex bg-neutral-100 rounded-lg px-3 py-1 text-sm"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                      {arena.comments && (
                        <p className="text-neutral-700 text-sm">
                          {arena.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="inline-flex bg-red-50 rounded-lg px-3 py-2">
                  <div className="text-red-600">
                    No arenas available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Round Yards */}
        <div>
          <h3 className="text-base font-medium text-neutral-900 mb-3 flex items-center gap-2">
            <span className="text-neutral-600"><CircleIcon /></span>
            Round Yards
          </h3>
          <div className="space-y-3">
            
            {ridingFacilities.roundYards && ridingFacilities.roundYards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ridingFacilities.roundYards.map((yard, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <div className="space-y-3">
                      <div className="inline-flex bg-primary-50 rounded-lg px-3 py-2 text-primary-600">
                        {yard.diameter}m diameter
                      </div>
                      {yard.comments && (
                        <p className="text-neutral-700 text-sm">
                          {yard.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
               
                <div className="inline-flex bg-red-50 rounded-lg px-3 py-2">
                  <div className="text-red-600">
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
