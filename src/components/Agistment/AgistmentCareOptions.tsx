import { AgistmentCare } from '../../types/agistment';

interface AgistmentCareOptionsProps {
  care?: AgistmentCare;
}

export const AgistmentCareOptions: React.FC<AgistmentCareOptionsProps> = ({
  care,
}) => {
  if (!care) return null;

  return (
    <div className="space-y-3">
      {/* Self Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.selfCare?.available ? "text-primary-600" : "text-neutral-400"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.selfCare?.available ? "font-medium text-neutral-900" : "text-neutral-500"}>
              Self Care
            </div>
            <span className={care?.selfCare?.available ? "chip-available" : "chip-unavailable"}>
              {care?.selfCare?.available ? "Available" : "Unavailable"}
            </span>
          </div>
          {care?.selfCare?.available && care.selfCare.monthlyPrice > 0 && (
            <div className="text-neutral-700">
              (<b>${care.selfCare.monthlyPrice}</b> per month)
            </div>
          )}
        </div>
        {care?.selfCare?.comments && (
          <div className="text-sm text-neutral-600 pl-7">
            {care.selfCare.comments}
          </div>
        )}
      </div>

      {/* Part Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.partCare?.available ? "text-primary-600" : "text-neutral-400"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.partCare?.available ? "font-medium text-neutral-900" : "text-neutral-500"}>
              Part Care
            </div>
            <span className={care?.partCare?.available ? "chip-available" : "chip-unavailable"}>
              {care?.partCare?.available ? "Available" : "Unavailable"}
            </span>
          </div>
          {care?.partCare?.available && care.partCare.monthlyPrice > 0 && (
            <div className="text-neutral-700">
              (<b>${care.partCare.monthlyPrice}</b> per month)
            </div>
          )}
        </div>
        {care?.partCare?.comments && (
          <div className="text-sm text-neutral-600 pl-7">
            {care.partCare.comments}
          </div>
        )}
      </div>

      {/* Full Care */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={care?.fullCare?.available ? "text-primary-600" : "text-neutral-400"}>
              {/* Add icon here if needed */}
            </div>
            <div className={care?.fullCare?.available ? "font-medium text-neutral-900" : "text-neutral-500"}>
              Full Care
            </div>
            <span className={care?.fullCare?.available ? "chip-available" : "chip-unavailable"}>
              {care?.fullCare?.available ? "Available" : "Unavailable"}
            </span>
          </div>
          {care?.fullCare?.available && care.fullCare.monthlyPrice > 0 && (
            <div className="text-neutral-700">
              (<b>${care.fullCare.monthlyPrice}</b> per month)
            </div>
          )}
        </div>
        {care?.fullCare?.comments && (
          <div className="text-sm text-neutral-600 pl-7">
            {care.fullCare.comments}
          </div>
        )}
      </div>

    </div>
  );
};
