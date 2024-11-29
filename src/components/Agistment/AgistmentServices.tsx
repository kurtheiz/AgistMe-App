import { EditIcon } from '../../components/Icons';

interface AgistmentServicesProps {
  services: string[];
  isEditable?: boolean;
}

export const AgistmentServices: React.FC<AgistmentServicesProps> = ({
  services,
  isEditable = false
}) => {
  return (
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Property Services</h2>
        {isEditable && (
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
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
  );
};
