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
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h3 className="agistment-section-title">Care Options</h3>
        {isEditable && (
          <button className="btn-edit">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="agistment-section-content grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Self Care */}
        <div className="border-title-card">
          <span className="border-title-card-title">Self Care</span>
          <div className="border-title-card-content">
            {care.selfCare.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="chip-available">
                    Available
                  </span>
                  {care.selfCare.monthlyPrice !== 0 && (
                    <div className="paddock-costs">
                      <p className="paddock-cost-item">
                        ${care.selfCare.monthlyPrice}
                        <span className="paddock-cost-period">/month</span>
                      </p>
                    </div>
                  )}
                  {care.selfCare.comments && (
                    <p className="comments">
                      {care.selfCare.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="chip-unavailable">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Part Care */}
        <div className="border-title-card">
          <span className="border-title-card-title">Part Care</span>
          <div className="border-title-card-content">
            {care.partCare?.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="chip-available">
                    Available
                  </span>
                  {care.partCare?.monthlyPrice !== 0 && (
                    <div className="paddock-costs">
                      <p className="paddock-cost-item">
                        ${care.partCare?.monthlyPrice}
                        <span className="paddock-cost-period">/month</span>
                      </p>
                    </div>
                  )}
                  {care.partCare?.comments && (
                    <p className="comments">
                      {care.partCare?.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="chip-unavailable">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Full Care */}
        <div className="border-title-card">
          <span className="border-title-card-title">Full Care</span>
          <div className="border-title-card-content">
            {care.fullCare.available ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="chip-available">
                    Available
                  </span>
                  {care.fullCare.monthlyPrice !== 0 && (
                    <div className="paddock-costs">
                      <p className="paddock-cost-item">
                        ${care.fullCare.monthlyPrice}
                        <span className="paddock-cost-period">/month</span>
                      </p>
                    </div>
                  )}
                  {care.fullCare.comments && (
                    <p className="comments">
                      {care.fullCare.comments}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="chip-unavailable">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
