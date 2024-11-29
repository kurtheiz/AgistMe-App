import { EditIcon } from '../../components/Icons';
import { formatAvailabilityDate } from '../../utils/dates';
import { Agistment } from '../../types/agistment';

interface AgistmentPaddocksProps {
  paddocks: Agistment['paddocks'];
  isEditable?: boolean;
}

const calculateMonthlyPrice = (weeklyPrice: number) => {
  return Math.round((weeklyPrice * 52) / 12);
};

export const AgistmentPaddocks: React.FC<AgistmentPaddocksProps> = ({
  paddocks,
  isEditable = false
}) => {
  return (
    <div className="bg-white dark:bg-transparent p-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Paddocks Available</h2>
        {isEditable && (
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Private Paddocks */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Private
          </span>
          <div className="flex flex-col items-center pt-2">
            {paddocks.privatePaddocks.total === 0 ? (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 px-3 py-1.5 rounded-lg">
                Unavailable
              </span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                      paddocks.privatePaddocks.available === 0
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                        : paddocks.privatePaddocks.whenAvailable && new Date(paddocks.privatePaddocks.whenAvailable) > new Date()
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    } rounded-lg px-3 py-1.5`}>
                      {`${paddocks.privatePaddocks.available} of ${paddocks.privatePaddocks.total}`}
                    </span>
                    {paddocks.privatePaddocks.whenAvailable && (
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                        {formatAvailabilityDate(paddocks.privatePaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${paddocks.privatePaddocks.weeklyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                    </p>
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${calculateMonthlyPrice(paddocks.privatePaddocks.weeklyPrice)}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shared Paddocks */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Shared
          </span>
          <div className="flex flex-col items-center pt-2">
            {paddocks.sharedPaddocks.total === 0 ? (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 px-3 py-1.5 rounded-lg">
                Unavailable
              </span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                      paddocks.sharedPaddocks.available === 0
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                        : paddocks.sharedPaddocks.whenAvailable && new Date(paddocks.sharedPaddocks.whenAvailable) > new Date()
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    } rounded-lg px-3 py-1.5`}>
                      {`${paddocks.sharedPaddocks.available} of ${paddocks.sharedPaddocks.total}`}
                    </span>
                    {paddocks.sharedPaddocks.whenAvailable && (
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                        {formatAvailabilityDate(paddocks.sharedPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${paddocks.sharedPaddocks.weeklyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                    </p>
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${calculateMonthlyPrice(paddocks.sharedPaddocks.weeklyPrice)}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group Paddocks */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 relative">
          <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-neutral-900 text-base text-neutral-900 dark:text-white font-medium">
            Group
          </span>
          <div className="flex flex-col items-center pt-2">
            {paddocks.groupPaddocks.total === 0 ? (
              <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 px-3 py-1.5 rounded-lg">
                Unavailable
              </span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`text-xl sm:text-2xl font-bold inline-flex items-center justify-center min-w-[5.5rem] ${
                      paddocks.groupPaddocks.available === 0
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                        : paddocks.groupPaddocks.whenAvailable && new Date(paddocks.groupPaddocks.whenAvailable) > new Date()
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    } rounded-lg px-3 py-1.5`}>
                      {`${paddocks.groupPaddocks.available} of ${paddocks.groupPaddocks.total}`}
                    </span>
                    {paddocks.groupPaddocks.whenAvailable && (
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                        {formatAvailabilityDate(paddocks.groupPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${paddocks.groupPaddocks.weeklyPrice}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/week</span>
                    </p>
                    <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      ${calculateMonthlyPrice(paddocks.groupPaddocks.weeklyPrice)}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
