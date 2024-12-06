import { useEffect, useState } from 'react';
import { AgistmentSearchResponse } from '../types/search';
import PropertyCard from './PropertyCard';

interface AgistmentListProps {
  agistments: AgistmentSearchResponse[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  matchType?: 'EXACT' | 'ADJACENT';
  title?: string;
}

export function AgistmentList({ 
  agistments = [], 
  onLoadMore, 
  hasMore = false,
  isLoading = false,
  matchType = 'EXACT',
  title
}: AgistmentListProps) {
  // Keep internal state of the growing list
  const [internalList, setInternalList] = useState<AgistmentSearchResponse[]>([]);

  // Update internal list when new agistments arrive
  useEffect(() => {
    if (Array.isArray(agistments) && agistments.length > 0) {
      setInternalList(prev => {
        // If new items are less than current, it's a fresh search
        if (agistments.length <= prev.length) {
          return agistments;
        }
        // Otherwise, append new items
        return [...prev, ...agistments.slice(prev.length)];
      });
    } else {
      setInternalList([]);
    }
  }, [agistments]);
  
  return (
    <div>
      {title && (
        <h2 className="text-xl font-semibold mb-4 px-4 md:px-0">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Array.isArray(internalList) && internalList.map((agistment) => (
          <PropertyCard key={agistment.id} agistment={agistment} />
        ))}
      </div>
      {(!Array.isArray(internalList) || internalList.length === 0) && (
        <div className="text-center text-gray-500">
          No {matchType.toLowerCase()} matches found
        </div>
      )}
      {hasMore && !isLoading && (
        <div className="text-center mt-4">
          <button
            onClick={onLoadMore}
            className="button-secondary"
          >
            Load More
          </button>
        </div>
      )}
      {isLoading && (
        <div className="text-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}
    </div>
  );
}
