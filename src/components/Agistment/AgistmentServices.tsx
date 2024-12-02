import React from 'react';

interface AgistmentServicesProps {
  services?: string[];
}

export const AgistmentServices: React.FC<AgistmentServicesProps> = ({
  services = []
}) => {
  return (
    <div className="space-y-4">
      {services && services.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
            >
              {service}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-400">No services listed</p>
      )}
    </div>
  );
};
