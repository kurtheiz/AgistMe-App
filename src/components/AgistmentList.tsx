import { Fragment } from 'react';
import { AgistmentSearchResponse } from '../types/search';
import PropertyCard from './PropertyCard';
import { Advert } from '../services/advert.service';

interface AgistmentListProps {
  agistments: AgistmentSearchResponse[];
  adverts?: Advert[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  title?: string;
  searchCriteria?: {
    paddockTypes?: ('Private' | 'Shared' | 'Group')[];
  };
}

export default function AgistmentList({ 
  agistments = [], 
  adverts = [],
  onLoadMore, 
  hasMore = false,
  isLoading = false,
  title,
  searchCriteria
}: AgistmentListProps) {
  const renderAdvertAfterIndex = (index: number) => {
    const advertIndex = Math.floor(index / 4); // Show an advert after every 4 properties
    return adverts[advertIndex % adverts.length];
  };
  
  return (
    <div>
      {title && (
        <h2 className="text-xl font-semibold mb-4 px-4 md:px-0">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Array.isArray(agistments) && agistments.map((agistment, index) => (
          <Fragment key={agistment.id}>
            <PropertyCard 
              agistment={agistment}
              searchCriteria={searchCriteria}
            />
            {adverts.length > 0 && (index === agistments.length - 1 || index % 4 === 3) && (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center">
                <a 
                  href={renderAdvertAfterIndex(index)?.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block max-w-[320px] border border-black"
                >
                  <img 
                    src={renderAdvertAfterIndex(index)?.link} 
                    alt="Advertisement" 
                    className="w-full h-[100px] object-contain shadow-lg"
                  />
                </a>
              </div>
            )}
          </Fragment>
        ))}
      </div>
      
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
