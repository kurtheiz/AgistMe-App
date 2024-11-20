import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';
import { Suburb } from '../../types/generated/models/Suburb';
import { suburbService } from '../../services/suburb.service';

interface SuburbSearchProps {
  onSelect: (locations: Suburb[]) => void;
  multiple?: boolean;
}

export function SuburbSearch({ onSelect, multiple = false }: SuburbSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Suburb[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const formatDisplayText = (suburb: Suburb): string => {
    return `${suburb.suburb}, ${suburb.state} ${suburb.postcode}`;
  };

  const searchLocations = useCallback(async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await suburbService.searchSuburbs(term, 10, false);
      setResults(response.suburbs || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchLocations(debouncedSearch);
  }, [debouncedSearch, searchLocations]);

  const handleSelect = (suburb: Suburb) => {
    const newLocations = multiple ? [...selectedLocations, suburb] : [suburb];
    setSelectedLocations(newLocations);
    onSelect(newLocations);
    setSearchTerm('');
  };

  const handleRemove = (locationId: string) => {
    const newLocations = selectedLocations.filter(loc => loc.id !== locationId);
    setSelectedLocations(newLocations);
    onSelect(newLocations);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border-2 rounded-lg border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 h-[72px] overflow-y-auto">
        <div className="flex flex-wrap gap-1.5 w-full">
          {multiple && selectedLocations.map((location) => (
            <div
              key={location.id}
              className="inline-flex items-center gap-1 px-2 h-7 text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md"
            >
              <span className="truncate">{formatDisplayText(location)}</span>
              <button
                onClick={() => handleRemove(location.id)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 p-0.5"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search suburbs..."
            className="h-7 flex-1 min-w-[200px] bg-transparent focus:outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-60 overflow-auto">
          {loading ? (
            <div key="loading" className="p-4 text-center text-neutral-600 dark:text-neutral-400">
              Loading...
            </div>
          ) : results.length === 0 ? (
            <div key="no-results" className="p-4 text-center text-neutral-600 dark:text-neutral-400">
              No results found
            </div>
          ) : (
            <div key="results" className="py-2">
              {results.map((suburb) => (
                <button
                  key={suburb.id}
                  onClick={() => handleSelect(suburb)}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                >
                  {formatDisplayText(suburb)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
