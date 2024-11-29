import { EditIcon } from '../../components/Icons';
import { AgistmentCare } from '../../types/agistment';

interface AgistmentCareOptionsProps {
  care: AgistmentCare;
  isEditable?: boolean;
}

export const AgistmentCareOptions: React.FC<AgistmentCareOptionsProps> = ({
  care,
  isEditable = false
}) => {
  return (
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Care Options</h3>
        {isEditable && (
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

         {/* Self Care */}
         <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Self Care
          </span>
          <div className="flex flex-col items-center pt-2">
            {care.selfCare.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-lg">
                    Available
                  </span>
                  {care.selfCare.monthlyPrice !== 0 && (
                    <span className="text-neutral-700 dark:text-neutral-300">
                      ${care.selfCare.monthlyPrice}/month
                    </span>
                  )}
                  {care.selfCare.comments && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                      {care.selfCare.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                Not Available
              </span>
            )}
          </div>
        </div>

        
        {/* Part Care */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Part Care
          </span>
          <div className="flex flex-col items-center pt-2">
            {care.partCare?.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-lg">
                    Available
                  </span>
                  {care.partCare?.monthlyPrice !== 0 && (
                    <span className="text-neutral-700 dark:text-neutral-300">
                      ${care.partCare?.monthlyPrice}/month
                    </span>
                  )}
                  {care.partCare?.comments && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                      {care.partCare?.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                Not Available
              </span>
            )}
          </div>
        </div>

       {/* Full Care */}
       <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Full Care
          </span>
          <div className="flex flex-col items-center pt-2">
            {care.fullCare.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-lg">
                    Available
                  </span>
                  {care.fullCare.monthlyPrice !== 0 && (
                    <span className="text-neutral-700 dark:text-neutral-300">
                      ${care.fullCare.monthlyPrice}/month
                    </span>
                  )}
                  {care.fullCare.comments && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                      {care.fullCare.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 px-3 py-1.5 rounded-lg">
                Not Available
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
