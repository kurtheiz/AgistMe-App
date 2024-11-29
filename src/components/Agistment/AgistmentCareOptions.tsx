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
                  <span className="status-badge-success">Available</span>
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
              <span className="status-badge-neutral">Not Available</span>
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
                  <span className="status-badge-success">Available</span>
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
              <span className="status-badge-neutral">Not Available</span>
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
                  <span className="status-badge-success">Available</span>
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
              <span className="status-badge-neutral">Not Available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
