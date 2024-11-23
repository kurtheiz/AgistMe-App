import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchModal } from './Search/SearchModal';
import { SearchIcon } from './Icons';
import { SearchCriteria } from '../types/search';

export const Home = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (criteria: SearchCriteria) => {
    if (criteria.searchHash) {
      navigate(`/agistments/search?q=${criteria.searchHash}`);
    }
    setIsSearchOpen(false);
  };

  return (
    <div className="flex-1 relative flex flex-col items-center text-lg pt-8 sm:pt-16 bg-white dark:bg-neutral-900">
 
      {/* Hero Section */}
      <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[5/2]">
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-lg opacity-50"
          style={{
            backgroundImage: 'url(/amh2-listing-cgi-2304w.jpeg)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-900 dark:text-white text-center max-w-2xl px-4">
            Find the perfect home for your horse
          </h1>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white text-base sm:text-lg font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Search Agistments
          </button>
        </div>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};
