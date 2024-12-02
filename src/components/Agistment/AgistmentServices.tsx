import React from 'react';

interface AgistmentServicesProps {
  services?: string[];
  isEditable?: boolean;
  onUpdate?: (updatedFields: any) => Promise<void>;
}

export const AgistmentServices: React.FC<AgistmentServicesProps> = ({
  services = []
}) => {
  return (
    <div className="agistment-section">
      
      <div className="agistment-section-content">
        {services && services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700"
              >
                {service}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">No services listed</p>
        )}
      </div>
    </div>
  );
};
