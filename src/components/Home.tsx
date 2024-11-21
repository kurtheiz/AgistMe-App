import { useState } from 'react';
import { SearchModal } from './Search/SearchModal';
import { SearchIcon } from './Icons';
import { SearchCriteria } from '../types/search';

export const Home = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (criteria: SearchCriteria) => {
    console.log('Search criteria:', criteria);
    // Handle search here
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-lg">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Welcome to AgistMe
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-300 max-w-2xl text-center">
        Find the perfect agistment for your horse.
      </p>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <SearchIcon className="h-5 w-5" />
        Search Agistment
      </button>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};
