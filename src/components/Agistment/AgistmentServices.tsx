import { Pencil } from 'lucide-react';

interface AgistmentServicesProps {
  services: string[];
  isEditable?: boolean;
}

export const AgistmentServices: React.FC<AgistmentServicesProps> = ({
  services,
  isEditable = false
}) => {
  return (
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h2 className="agistment-section-title">Property Services</h2>
        {isEditable && (
          <button className="btn-edit">
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
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
