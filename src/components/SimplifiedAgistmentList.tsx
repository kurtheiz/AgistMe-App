import { AgistmentResponse } from '../types/agistment';
import PropertyCard from './PropertyCard';

interface SimplifiedAgistmentListProps {
  agistments: AgistmentResponse[];
  onAgistmentClick?: (agistment: AgistmentResponse) => void;
}

export function SimplifiedAgistmentList({ agistments, onAgistmentClick }: SimplifiedAgistmentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {agistments.map((agistment) => (
        <PropertyCard 
          key={agistment.id} 
          agistment={agistment}
          onClick={() => onAgistmentClick?.(agistment)}
        />
      ))}
    </div>
  );
}
