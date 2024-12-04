import { AgistmentResponse } from '../types/agistment';
import PropertyCard from './PropertyCard';

interface AgistmentListProps {
  agistments: AgistmentResponse[];
  title: string;
  showCount?: boolean;
}

export function AgistmentList({ agistments, title, showCount = true }: AgistmentListProps) {
  const count = agistments.length;
  
  return (
    <div>
      <h2 className="text-left text-l py-4 px-4 md:px-0">
        {showCount ? `${count} ${title}` : title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {agistments.map((agistment) => (
          <PropertyCard key={agistment.id} agistment={agistment} />
        ))}
      </div>
      {agistments.length === 0 && (
        <div className="text-center text-gray-500">
          No agistments found
        </div>
      )}
    </div>
  );
}
