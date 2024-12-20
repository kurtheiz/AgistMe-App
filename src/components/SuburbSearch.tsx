import { useState, useCallback } from 'react';
import { Suburb, LocationType } from '../types/suburb';
import { suburbService } from '../services/suburb.service';
import { X } from 'lucide-react';

interface SuburbSearchProps {
  selectedSuburbs: Suburb[];
  onSuburbsChange: (suburbs: Suburb[]) => void;
  multiple?: boolean;
  includeRegions?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SuburbSearch({ 
  selectedSuburbs, 
  onSuburbsChange, 
  multiple = true, 
  includeRegions = true,
  disabled = false,
  className = ''
}: SuburbSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDisplayText = (suburb: Suburb): string => {
    if (suburb.locationType === LocationType.STATE) {
      return suburb.suburb || suburb.state;
    }
    if (suburb.locationType === LocationType.REGION) {
      return `${suburb.region}, ${suburb.state}`;
    }
    return `${suburb.suburb}, ${suburb.state} ${suburb.postcode}`;
  };

  const searchLocations = useCallback(async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await suburbService.searchSuburbs(term, 10, includeRegions);
      const suburbs = response.suburbs?.map(suburb => ({

        ...suburb,
        locationType: suburb.locationType || (
          suburb.locationType === 'STATE' ? LocationType.STATE :
          suburb.locationType === 'REGION' ? LocationType.REGION :
          LocationType.SUBURB
        )
      })) || [];
      
      // Filter out non-suburb locations when in single select mode
      const filteredSuburbs = multiple ? suburbs : suburbs.filter(suburb => 
        suburb.locationType === LocationType.SUBURB
      );
      
      setResults(filteredSuburbs);
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [includeRegions, multiple]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    searchLocations(value);
    setSearchTerm(value);
  };

  const handleSelect = (suburb: Suburb) => {
    const newLocations = multiple ? [...selectedSuburbs, suburb] : [suburb];
    onSuburbsChange(newLocations);
    setSearchTerm('');
    
    // Scroll the chips container to the bottom after a short delay to ensure the new chip is rendered
    setTimeout(() => {
      const container = document.querySelector('.suburb-chips-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  };

  const handleRemove = (locationId: string) => {
    const newLocations = selectedSuburbs.filter(loc => loc.id !== locationId);
    onSuburbsChange(newLocations);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex flex-wrap gap-1.5 p-2 border-2 rounded-lg border-neutral-300 bg-white ${multiple ? 'h-[72px] overflow-y-auto' : 'h-10'} suburb-chips-container ${disabled ? 'bg-neutral-100' : ''}`}>
        <div className="flex flex-wrap gap-1.5 w-full">
          {multiple && selectedSuburbs?.map((location) => (
            <div
              key={location.id}
              className="inline-flex items-center gap-1 px-2 h-7 text-sm bg-primary-100 text-primary-800 rounded-md"
            >
              <div className="flex items-center gap-1.5">
                <span className="truncate">{formatDisplayText(location)}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-200">
                  {location.locationType === LocationType.STATE ? 'State' : 
                   location.locationType === LocationType.REGION ? 'Region' : 'Suburb'}
                </span>
              </div>
              <button
                onClick={() => handleRemove(location.id)}
                className="text-primary-600 hover:text-primary-800 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={disabled}
            placeholder={multiple ? "Suburb, post code, region or state" : "Enter a suburb"}
            className={`h-7 flex-1 min-w-[200px] bg-transparent focus:outline-none text-sm text-neutral-700 placeholder-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap ${
              disabled 
                ? 'bg-neutral-100 cursor-not-allowed border-neutral-300' 
                : 'bg-white border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchTerm && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-60 overflow-auto">
          {loading ? (
            <div key="loading" className="p-4 text-center text-neutral-600">
              Loading...
            </div>
          ) : results.length === 0 ? (
            <div key="no-results" className="p-4 text-center text-neutral-600">
              No results found
            </div>
          ) : (
            <div key="results" className="py-2">
              {results.map((suburb) => (
                <button
                  key={suburb.id}
                  onClick={() => handleSelect(suburb)}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span>{formatDisplayText(suburb)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suburb.locationType === LocationType.STATE 
                        ? 'bg-blue-100 text-blue-800'
                        : suburb.locationType === LocationType.REGION
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {suburb.locationType === LocationType.STATE ? 'State' : 
                       suburb.locationType === LocationType.REGION ? 'Region' : 'Suburb'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
