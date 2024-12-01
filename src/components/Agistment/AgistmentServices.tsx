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
      <div className="agistment-section-header">
        <h2 className="agistment-section-title">Property Services</h2>
      </div>
      <div className="agistment-section-content">
        {services && services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
              >
                {service}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">No services listed</p>
        )}
      </div>
    </div>
  );
};
