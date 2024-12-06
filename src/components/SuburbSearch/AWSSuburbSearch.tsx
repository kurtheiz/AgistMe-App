import { useState, useEffect, useRef } from 'react';
import { Place } from '@aws-sdk/client-location';
import { locationService } from '../../services/location.service';
import { Suburb, LocationType } from '../../types/suburb';
import { Search, X } from 'lucide-react';

interface AWSSuburbSearchProps {
  selectedSuburbs: Suburb[];
  onSuburbsChange: (suburbs: Suburb[]) => void;
  disabled?: boolean;
}

export function AWSSuburbSearch({ selectedSuburbs, onSuburbsChange, disabled = false }: AWSSuburbSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add click outside listener
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    if (value.length >= 3) {
      setIsLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await locationService.searchSuburbs(value);
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching suburbs:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSuburbSelect = (place: Place) => {
    if (!place.Municipality || !place.Region || !place.Country) return;

    const newSuburb: Suburb = {
      id: place.Label || '',
      suburb: place.Municipality || '',
      state: place.Region || '',
      postcode: place.PostalCode || '',
      region: place.Region || '',
      geohash: '',
      locationType: LocationType.SUBURB
    };

    if (!selectedSuburbs.some(s => s.id === newSuburb.id)) {
      onSuburbsChange([...selectedSuburbs, newSuburb]);
    }

    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSuburb = (suburbId: string) => {
    onSuburbsChange(selectedSuburbs.filter(s => s.id !== suburbId));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSuburbs.map((suburb) => (
          <div
            key={suburb.id}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-primary-50 text-primary-700 rounded-md"
          >
            <span>{`${suburb.suburb}, ${suburb.postcode}, ${suburb.state}`}</span>
            <button
              onClick={() => removeSuburb(suburb.id)}
              className="text-primary-700 hover:text-primary-900"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search suburbs..."
          className="w-full px-3 py-2 border rounded-md pr-10"
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
          ) : (
            <Search size={20} className="text-gray-400" />
          )}
        </div>
      </div>
      {showSuggestions && (searchText.length >= 3) && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.length === 0 && !isLoading ? (
            <li className="px-4 py-2 text-sm text-gray-500">No results found</li>
          ) : (
            suggestions.map((place, index) => (
              <li
                key={place.Label || index}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuburbSelect(place)}
              >
                {place.Municipality}, {place.PostalCode}, {place.Region}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
