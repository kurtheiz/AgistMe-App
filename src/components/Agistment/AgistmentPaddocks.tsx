import { format, parseISO } from 'date-fns';
import { Agistment, PaddockBase } from '../../types/agistment';

interface AgistmentPaddocksProps {
  paddocks: Agistment['paddocks'];
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
    <div className="space-y-2">
      <div className="agistment-text space-y-2">
        <p>
          Our <span className="font-bold">{type.toLowerCase()} paddocks</span> have space for <span className="font-bold">{paddock.total}</span> {paddock.total === 1 ? 'horse' : 'horses'} in total{' '}
          {paddock.available === 0 ? (
            <>with <span className="font-bold">no</span> spaces available at present.</>
          ) : (
            <>
              and {!paddock.whenAvailable || !isFutureDate ? 'we have' : 'we will have'} <span className="font-bold">{paddock.available}</span> {paddock.available === 1 ? 'space' : 'spaces'} available {formatAvailabilityDate(paddock.whenAvailable)}.</>
          )} 
          {paddock.weeklyPrice === 0 ? (
            <> Weekly prices are available <span className="font-bold">on request</span>.</>
          ) : (
            <> We charge <span className="font-bold">${paddock.weeklyPrice}</span> per week for each space, which is about <span className="font-bold">${monthlyPrice}</span> per month.</>
          )}
          {paddock.comments && ` ${paddock.comments}`}
        </p>
      </div>
    </div>
  );
};

export const AgistmentPaddocks = ({
  paddocks = {
    privatePaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    sharedPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    groupPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined }
  }
}: AgistmentPaddocksProps) => {
  return (
    <div>
      <div className="space-y-4">
        {/* Private Paddocks */}
        {paddocks?.privatePaddocks?.total > 0 ? (
          formatPaddockInfo(paddocks.privatePaddocks, "Private")
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">We do not offer <strong>Private</strong> paddocks.</p>
        )}

        {/* Shared Paddocks */}
        {paddocks?.sharedPaddocks?.total > 0 ? (
          formatPaddockInfo(paddocks.sharedPaddocks, "Shared")
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">We do not offer <strong>Shared</strong> paddocks.</p>
        )}

        {/* Group Paddocks */}
        {paddocks?.groupPaddocks?.total > 0 ? (
          formatPaddockInfo(paddocks.groupPaddocks, "Group")
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">We do not offer <strong>Group</strong> paddocks.</p>
        )}

        {/* Show if no paddocks at all are offered */}
        {!paddocks?.privatePaddocks?.total && !paddocks?.sharedPaddocks?.total && !paddocks?.groupPaddocks?.total && (
          <p className="text-neutral-600 dark:text-neutral-400">No paddocks are currently being offered.</p>
        )}
      </div>
    </div>
  );
};
