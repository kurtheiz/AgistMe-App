import React from 'react';
import { Crown, Building2 } from 'lucide-react';

type ListingType = 'professional' | 'premium';

interface ListingTypeBadgeProps {
  type: ListingType;
  className?: string;
}

export const ListingTypeBadge: React.FC<ListingTypeBadgeProps> = ({ type, className = '' }) => {
  if (type === 'professional') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ${className}`}>
        <Building2 className="w-3 h-3" />
        Professional
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 ${className}`}>
      <Crown className="w-3 h-3" />
      Premium
    </div>
  );
};
