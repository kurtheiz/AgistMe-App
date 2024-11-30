import { Calendar } from 'lucide-react';
import { formatAvailabilityDate } from '../../utils/dates';
import { Agistment } from '../../types/agistment';

interface AgistmentPaddocksViewProps {
  paddocks: Agistment['paddocks'];
}

const calculateMonthlyPrice = (weeklyPrice: number) => {
  return Math.round((weeklyPrice * 52) / 12);
};

export const AgistmentPaddocksView: React.FC<AgistmentPaddocksViewProps> = ({
  paddocks = {
    privatePaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    sharedPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined },
    groupPaddocks: { total: 0, available: 0, weeklyPrice: 0, comments: '', whenAvailable: undefined }
  }
}) => {
  return (
    <div className="paddock-grid">
      {/* Private Paddocks */}
      <div className="border-title-card">
        <span className="border-title-card-title">Private Paddocks</span>
        <div className="border-title-card-content">
          {!paddocks?.privatePaddocks?.total ? (
            <span className="chip-unavailable">Unavailable</span>
          ) : (
            <>
              <div className="w-full grid grid-cols-2 gap-4 items-start">
                <div className="flex flex-col items-center">
                  <span className={`paddock-availability ${
                    !paddocks?.privatePaddocks?.available
                      ? 'paddock-availability-unavailable'
                      : paddocks?.privatePaddocks?.whenAvailable && new Date(paddocks.privatePaddocks.whenAvailable) > new Date()
                        ? 'paddock-availability-pending'
                        : 'paddock-availability-available'
                  }`}>
                    {`${paddocks?.privatePaddocks?.available ?? 0} of ${paddocks?.privatePaddocks?.total ?? 0}`}
                  </span>
                  {paddocks?.privatePaddocks?.whenAvailable && (
                    <p className="paddock-availability-date flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatAvailabilityDate(paddocks.privatePaddocks.whenAvailable)}
                    </p>
                  )}
                </div>
                <div className="paddock-costs">
                  <p className="paddock-cost-item">
                    ${paddocks?.privatePaddocks?.weeklyPrice ?? 0}
                    <span className="paddock-cost-period">/week</span>
                  </p>
                  <p className="paddock-cost-item">
                    ${calculateMonthlyPrice(paddocks?.privatePaddocks?.weeklyPrice ?? 0)}
                    <span className="paddock-cost-period">/month</span>
                  </p>
                </div>
              </div>
              {paddocks?.privatePaddocks?.comments && (
                <p className="comments">
                  {paddocks.privatePaddocks.comments}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Shared Paddocks */}
      <div className="border-title-card">
        <span className="border-title-card-title">Shared Paddocks</span>
        <div className="border-title-card-content">
          {!paddocks?.sharedPaddocks?.total ? (
            <span className="chip-unavailable">Unavailable</span>
          ) : (
            <>
              <div className="w-full grid grid-cols-2 gap-4 items-start">
                <div className="flex flex-col items-center">
                  <span className={`paddock-availability ${
                    !paddocks?.sharedPaddocks?.available
                      ? 'paddock-availability-unavailable'
                      : paddocks?.sharedPaddocks?.whenAvailable && new Date(paddocks.sharedPaddocks.whenAvailable) > new Date()
                        ? 'paddock-availability-pending'
                        : 'paddock-availability-available'
                  }`}>
                    {`${paddocks?.sharedPaddocks?.available ?? 0} of ${paddocks?.sharedPaddocks?.total ?? 0}`}
                  </span>
                  {paddocks?.sharedPaddocks?.whenAvailable && (
                    <p className="paddock-availability-date flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatAvailabilityDate(paddocks.sharedPaddocks.whenAvailable)}
                    </p>
                  )}
                </div>
                <div className="paddock-costs">
                  <p className="paddock-cost-item">
                    ${paddocks?.sharedPaddocks?.weeklyPrice ?? 0}
                    <span className="paddock-cost-period">/week</span>
                  </p>
                  <p className="paddock-cost-item">
                    ${calculateMonthlyPrice(paddocks?.sharedPaddocks?.weeklyPrice ?? 0)}
                    <span className="paddock-cost-period">/month</span>
                  </p>
                </div>
              </div>
              {paddocks?.sharedPaddocks?.comments && (
                <p className="comments">
                  {paddocks.sharedPaddocks.comments}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Group Paddocks */}
      <div className="border-title-card">
        <span className="border-title-card-title">Group Paddocks</span>
        <div className="border-title-card-content">
          {!paddocks?.groupPaddocks?.total ? (
            <span className="chip-unavailable">Unavailable</span>
          ) : (
            <>
              <div className="w-full grid grid-cols-2 gap-4 items-start">
                <div className="flex flex-col items-center">
                  <span className={`paddock-availability ${
                    !paddocks?.groupPaddocks?.available
                      ? 'paddock-availability-unavailable'
                      : paddocks?.groupPaddocks?.whenAvailable && new Date(paddocks.groupPaddocks.whenAvailable) > new Date()
                        ? 'paddock-availability-pending'
                        : 'paddock-availability-available'
                  }`}>
                    {`${paddocks?.groupPaddocks?.available ?? 0} of ${paddocks?.groupPaddocks?.total ?? 0}`}
                  </span>
                  {paddocks?.groupPaddocks?.whenAvailable && (
                    <p className="paddock-availability-date flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatAvailabilityDate(paddocks.groupPaddocks.whenAvailable)}
                    </p>
                  )}
                </div>
                <div className="paddock-costs">
                  <p className="paddock-cost-item">
                    ${paddocks?.groupPaddocks?.weeklyPrice ?? 0}
                    <span className="paddock-cost-period">/week</span>
                  </p>
                  <p className="paddock-cost-item">
                    ${calculateMonthlyPrice(paddocks?.groupPaddocks?.weeklyPrice ?? 0)}
                    <span className="paddock-cost-period">/month</span>
                  </p>
                </div>
              </div>
              {paddocks?.groupPaddocks?.comments && (
                <p className="comments">
                  {paddocks.groupPaddocks.comments}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
