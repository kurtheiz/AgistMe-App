import { SearchRequest } from '../../types/search';

interface SearchCriteriaDisplayProps {
  searchCriteria: SearchRequest;
  className?: string;
}

// Helper function to format facility name
const formatFacilityName = (facility: string): string => {
  switch (facility) {
    case 'feedRoom': return 'Feed Room';
    case 'tackRoom': return 'Tack Room';
    case 'floatParking': return 'Float Parking';
    case 'hotWash': return 'Hot Wash';
    case 'stable': return 'Stable';
    case 'tieUp': return 'Tie Up';
    default: return facility;
  }
};

// Helper function to format criteria for display
const formatCriteria = (searchCriteria: SearchRequest) => {
  const parts = [];
  
  if (searchCriteria.suburbs?.length > 0) {
    parts.push(`Location: ${searchCriteria.suburbs.map(s => s.suburb).join(', ')}`);
    if (searchCriteria.radius) {
      parts.push(`within ${searchCriteria.radius}km`);
    }
  }

  if (searchCriteria.paddockTypes?.length > 0) {
    parts.push(`Paddock Types: ${searchCriteria.paddockTypes.join(', ')}`);
  }

  if (searchCriteria.spaces > 0) {
    parts.push(`Spaces: ${searchCriteria.spaces}`);
  }

  if (searchCriteria.maxPrice > 0) {
    parts.push(`Max Price: $${searchCriteria.maxPrice}`);
  }

  if (searchCriteria.hasArena) {
    parts.push('Has Arena');
  }

  if (searchCriteria.hasRoundYard) {
    parts.push('Has Round Yard');
  }

  if (searchCriteria.facilities?.length > 0) {
    parts.push(`Facilities: ${searchCriteria.facilities.map(formatFacilityName).join(', ')}`);
  }

  if (searchCriteria.careTypes?.length > 0) {
    parts.push(`Care Types: ${searchCriteria.careTypes.map(type => `${type} Care`).join(', ')}`);
  }

  return parts;
};

export function SearchCriteriaDisplay({ searchCriteria, className = '' }: SearchCriteriaDisplayProps) {
  if (!searchCriteria) {
    return (
      <div className="text-sm text-gray-500">
        No search criteria available
      </div>
    );
  }

  const criteria = formatCriteria(searchCriteria);

  return (
    <div className={`bg-gray-50 rounded-md p-4 ${className}`}>
      <ul className="space-y-2">
        {criteria.map((criterion, index) => (
          <li key={index} className="text-sm text-gray-600">
            • {criterion}
          </li>
        ))}
      </ul>
    </div>
  );
}
