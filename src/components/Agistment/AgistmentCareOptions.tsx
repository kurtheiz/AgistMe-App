import { AgistmentCare, Agistment } from '../../types/agistment';

interface AgistmentCareOptionsProps {
  care?: AgistmentCare;
  isEditable?: boolean;
  onUpdate?: (updatedFields: Partial<Agistment>) => Promise<void>;
}

export const AgistmentCareOptions: React.FC<AgistmentCareOptionsProps> = ({
  care,
  isEditable,
  onUpdate
}) => {
  if (!care) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Care Options
        </h2>
        {isEditable && onUpdate && (
          <button 
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            onClick={() => {/* Add edit functionality */}}
          >
            Edit
          </button>
        )}
      </div>

      {/* Self Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.selfCare?.available ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.selfCare?.available ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}>
              Self Care
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              care?.selfCare?.available 
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {care?.selfCare?.available ? "Available" : "Not Available"}
            </span>
          </div>
          {care?.selfCare?.available && care.selfCare.monthlyPrice > 0 && (
            <div className="text-neutral-700 dark:text-neutral-300">
              (${care.selfCare.monthlyPrice}/month)
            </div>
          )}
        </div>
        {care?.selfCare?.comments && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400 pl-7">
            {care.selfCare.comments}
          </div>
        )}
      </div>

      {/* Part Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.partCare?.available ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.partCare?.available ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}>
              Part Care
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              care?.partCare?.available 
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {care?.partCare?.available ? "Available" : "Not Available"}
            </span>
          </div>
          {care?.partCare?.available && care.partCare.monthlyPrice > 0 && (
            <div className="text-neutral-700 dark:text-neutral-300">
              (${care.partCare.monthlyPrice}/month)
            </div>
          )}
        </div>
        {care?.partCare?.comments && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400 pl-7">
            {care.partCare.comments}
          </div>
        )}
      </div>

      {/* Full Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.fullCare?.available ? "text-primary-600 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.fullCare?.available ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}>
              Full Care
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              care?.fullCare?.available 
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {care?.fullCare?.available ? "Available" : "Not Available"}
            </span>
          </div>
          {care?.fullCare?.available && care.fullCare.monthlyPrice > 0 && (
            <div className="text-neutral-700 dark:text-neutral-300">
              (${care.fullCare.monthlyPrice}/month)
            </div>
          )}
        </div>
        {care?.fullCare?.comments && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400 pl-7">
            {care.fullCare.comments}
          </div>
        )}
      </div>

      {!care?.selfCare?.available && !care?.partCare?.available && !care?.fullCare?.available && (
        <div>
          <div className="inline-flex">
            <div className="font-bold text-red-600 dark:text-red-400">
              No care options available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
