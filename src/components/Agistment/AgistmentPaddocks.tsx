import { Pencil, Calendar } from 'lucide-react';
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
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h2 className="agistment-section-title">Paddocks Available</h2>
        {isEditable && (
          <button className="btn-edit">
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="paddock-grid">
        {/* Private Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Private</span>
          <div className="border-title-card-content">
            {paddocks.privatePaddocks.total === 0 ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      paddocks.privatePaddocks.available === 0
                        ? 'paddock-availability-unavailable'
                        : paddocks.privatePaddocks.whenAvailable && new Date(paddocks.privatePaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks.privatePaddocks.available} of ${paddocks.privatePaddocks.total}`}
                    </span>
                    {paddocks.privatePaddocks.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.privatePaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks.privatePaddocks.weeklyPrice}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks.privatePaddocks.weeklyPrice)}
                      <span className="paddock-cost-period">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shared Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Shared</span>
          <div className="border-title-card-content">
            {paddocks.sharedPaddocks.total === 0 ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      paddocks.sharedPaddocks.available === 0
                        ? 'paddock-availability-unavailable'
                        : paddocks.sharedPaddocks.whenAvailable && new Date(paddocks.sharedPaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks.sharedPaddocks.available} of ${paddocks.sharedPaddocks.total}`}
                    </span>
                    {paddocks.sharedPaddocks.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.sharedPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks.sharedPaddocks.weeklyPrice}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks.sharedPaddocks.weeklyPrice)}
                      <span className="paddock-cost-period">/month</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group Paddocks */}
        <div className="border-title-card">
          <span className="border-title-card-title">Group</span>
          <div className="border-title-card-content">
            {paddocks.groupPaddocks.total === 0 ? (
              <span className="paddock-availability-none">Unavailable</span>
            ) : (
              <>
                <div className="w-full grid grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className={`paddock-availability ${
                      paddocks.groupPaddocks.available === 0
                        ? 'paddock-availability-unavailable'
                        : paddocks.groupPaddocks.whenAvailable && new Date(paddocks.groupPaddocks.whenAvailable) > new Date()
                          ? 'paddock-availability-pending'
                          : 'paddock-availability-available'
                    }`}>
                      {`${paddocks.groupPaddocks.available} of ${paddocks.groupPaddocks.total}`}
                    </span>
                    {paddocks.groupPaddocks.whenAvailable && (
                      <p className="paddock-availability-date flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatAvailabilityDate(paddocks.groupPaddocks.whenAvailable)}
                      </p>
                    )}
                  </div>
                  <div className="paddock-costs">
                    <p className="paddock-cost-item">
                      ${paddocks.groupPaddocks.weeklyPrice}
                      <span className="paddock-cost-period">/week</span>
                    </p>
                    <p className="paddock-cost-item">
                      ${calculateMonthlyPrice(paddocks.groupPaddocks.weeklyPrice)}
                      <span className="paddock-cost-period">/month</span>
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
