import { format, parseISO } from 'date-fns';
import { Agistment, PaddockBase } from '../../types/agistment';

interface AgistmentPaddocksProps {
  paddocks?: Agistment['paddocks'];
}

const calculateMonthlyPrice = (weeklyPrice: number) => {
  return Math.round((weeklyPrice * 52) / 12);
};

const formatAvailabilityDate = (whenAvailable: Date | undefined | null) => {
  if (!whenAvailable) {
    return <span className="font-bold">now</span>;
  }

  const availabilityDate = typeof whenAvailable === 'string' ? parseISO(whenAvailable) : whenAvailable;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Reset hours to compare just the dates
  now.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  const compareDate = new Date(availabilityDate);
  compareDate.setHours(0, 0, 0, 0);

  // If date is today or in the past, show "now"
  if (compareDate.getTime() <= now.getTime()) {
    return <span className="font-bold">now</span>;
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return <span className="font-bold">tomorrow</span>;
  } else {
    return <span className="font-bold">on {format(availabilityDate, 'EEEE, d MMMM yyyy')}</span>;
  }
};

const formatPaddockInfo = (paddock: PaddockBase, type: string) => {
  if (!paddock.total) return null;
  
  const monthlyPrice = calculateMonthlyPrice(paddock.weeklyPrice);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const availabilityDate = paddock.whenAvailable ? new Date(paddock.whenAvailable) : null;
  if (availabilityDate) {
    availabilityDate.setHours(0, 0, 0, 0);
  }
  const isFutureDate = availabilityDate && availabilityDate.getTime() > now.getTime();

  return (
    <div>
      <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-3">
        {type} Paddocks
      </h3>
      <div className="space-y-3">
        <p className="text-neutral-700 dark:text-neutral-300">
          This property offers <span className="font-semibold text-neutral-900 dark:text-neutral-100">{paddock.totalPaddocks}</span> {type.toLowerCase()} {paddock.totalPaddocks === 1 ? 'paddock' : 'paddocks'} that can accommodate up to <span className="font-semibold text-neutral-900 dark:text-neutral-100">{paddock.total}</span> horses.
        </p>

        {paddock.available > 0 ? (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {paddock.available} {paddock.available === 1 ? 'spot' : 'spots'}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">
              Available {formatAvailabilityDate(paddock.whenAvailable)}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              No spots available
            </div>
          </div>
        )}
        
        <p className="text-neutral-700 dark:text-neutral-300">
          {paddock.weeklyPrice === 0 ? (
            <>Please contact us for pricing details.</>
          ) : (
            <>
              Agistment is <span className="font-semibold text-neutral-900 dark:text-neutral-100">${paddock.weeklyPrice}</span> per week per horse (approximately <span className="font-semibold text-neutral-900 dark:text-neutral-100">${monthlyPrice}</span> per month).
            </>
          )}
        </p>
        
        {paddock.comments && (
          <p className="text-neutral-700 dark:text-neutral-300">
            {paddock.comments}
          </p>
        )}
      </div>
    </div>
  );
};

export const AgistmentPaddocks = ({
  paddocks = {
    privatePaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined, totalPaddocks: 0 },
    sharedPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined, totalPaddocks: 0 },
    groupPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined, totalPaddocks: 0 }
  }
}: AgistmentPaddocksProps) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        {/* Private Paddocks */}
        <div>
          {paddocks?.privatePaddocks?.total > 0 ? (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.privatePaddocks, "Private")}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">This property does not offer private paddock arrangements.</p>
          )}
        </div>

        {/* Shared Paddocks */}
        <div>
          {paddocks?.sharedPaddocks?.total > 0 ? (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.sharedPaddocks, "Shared")}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">This property does not offer shared paddock arrangements.</p>
          )}
        </div>

        {/* Group Paddocks */}
        <div>
          {paddocks?.groupPaddocks?.total > 0 ? (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.groupPaddocks, "Group")}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">This property does not offer group paddock arrangements.</p>
          )}
        </div>

        {/* Show if no paddocks at all are offered */}
        {!paddocks?.privatePaddocks?.total && !paddocks?.sharedPaddocks?.total && !paddocks?.groupPaddocks?.total && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">This property is not currently offering any paddock arrangements.</p>
        )}
      </div>
    </div>
  );
};
