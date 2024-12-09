import { format, parseISO } from 'date-fns';
import { AgistmentResponse, PaddockBase } from '../../types/agistment';

interface AgistmentPaddocksProps {
  paddocks: AgistmentResponse['paddocks'];
  onUpdate?: (updatedFields: Partial<AgistmentResponse>) => Promise<void>;
  isEditable?: boolean;
  agistmentId?: string;
}

const calculateMonthlyPrice = (weeklyPrice: number) => {
  return Math.round((weeklyPrice * 52) / 12);
};

const formatAvailabilityDate = (whenAvailable: Date | string | undefined | null) => {
  if (!whenAvailable) {
    return <span className="font-bold">Now</span>;
  }

  const availabilityDate = typeof whenAvailable === 'string' ? parseISO(whenAvailable) : whenAvailable;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(availabilityDate);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate <= today) {
    return <span className="font-bold">Now</span>;
  }

  return <span className="font-bold">on {format(availabilityDate, 'd MMM yyyy')}</span>;
};

const formatPaddockInfo = (paddock: PaddockBase, type: string) => {
  if (paddock.totalPaddocks === 0) return null;

  const monthlyPrice = calculateMonthlyPrice(paddock.weeklyPrice);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const availabilityDate = paddock.whenAvailable ? new Date(paddock.whenAvailable) : null;
  if (availabilityDate) {
    availabilityDate.setHours(0, 0, 0, 0);
  }

  const isDateInFuture = (date: string | null | undefined) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate > today;
  };

  return (
    <div>
      <div className="space-y-3">
        <p className="text-neutral-700">
          This property offers <span className="font-semibold text-neutral-900">{paddock.totalPaddocks}</span> {type.toLowerCase()} {paddock.totalPaddocks === 1 ? 'paddock' : 'paddocks'} that can accommodate up to <span className="font-semibold text-neutral-900">{paddock.total}</span> horses.
        </p>

        {paddock.total > 0 && (
          <>
            {paddock.available > 0 ? (
              <div>
                <div className={`inline-flex items-center gap-2 ${
                  paddock.whenAvailable && isDateInFuture(paddock.whenAvailable) 
                    ? 'bg-amber-50'
                    : 'bg-primary-50'
                } rounded-lg px-3 py-2`}>
                  <div className={`font-bold ${
                    paddock.whenAvailable && isDateInFuture(paddock.whenAvailable) 
                      ? 'text-amber-600'
                      : 'text-primary-600'
                  }`}>
                    {paddock.available} {paddock.available === 1 ? 'spot' : 'spots'}
                  </div>
                  <div className={
                    paddock.whenAvailable && isDateInFuture(paddock.whenAvailable) 
                      ? 'text-amber-600'
                      : 'text-primary-700'
                  }>
                    available {formatAvailabilityDate(paddock.whenAvailable)}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="inline-flex bg-red-50 rounded-lg px-3 py-2">
                  <div className="font-bold text-red-600">
                    No spots available
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-neutral-700">
          {paddock.weeklyPrice === 0 ? (
            <>Please contact us for pricing details.</>
          ) : (
            <>
              Agistment is <span className="font-semibold text-neutral-900">${paddock.weeklyPrice}</span> per week per horse (approximately <span className="font-semibold text-neutral-900">${monthlyPrice}</span> per month).
            </>
          )}
        </p>

        {paddock.comments && (
          <p className="text-neutral-700">
            {paddock.comments}
          </p>
        )}
      </div>
    </div>
  );
};

export const AgistmentPaddocks = ({
  paddocks,
  onUpdate: _onUpdate,
  isEditable: _isEditable,
  agistmentId: _agistmentId
}: AgistmentPaddocksProps) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 items-start">
        {/* Private Paddocks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-medium text-neutral-900">
              Private Paddocks
            </h3>
            {paddocks?.privatePaddocks?.totalPaddocks === 0 && (
              <div className="chip-unavailable">
                <div>
                  Unavailable
                </div>
              </div>
            )}
          </div>
          {paddocks?.privatePaddocks?.totalPaddocks > 0 && (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.privatePaddocks, "Private")}
            </div>
          )}
        </div>

        {/* Shared Paddocks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-medium text-neutral-900">
              Shared Paddocks
            </h3>
            {paddocks?.sharedPaddocks?.totalPaddocks === 0 && (
              <div className="chip-unavailable">
                  Unavailable
              </div>
            )}
          </div>
          {paddocks?.sharedPaddocks?.totalPaddocks > 0 && (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.sharedPaddocks, "Shared")}
            </div>
          )}
        </div>

        {/* Group Paddocks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-medium text-neutral-900">
              Group Paddocks
            </h3>
            {paddocks?.groupPaddocks?.totalPaddocks === 0 && (
              <div className="chip-unavailable">
                  Unavailable
              </div>
            )}
          </div>
          {paddocks?.groupPaddocks?.totalPaddocks > 0 && (
            <div className="rounded-lg">
              {formatPaddockInfo(paddocks.groupPaddocks, "Group")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
