import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchRequest, PaddockType, CareType, FacilityKey } from '../../types/search';
import { LocationType, Suburb } from '../../types/suburb';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon,
} from '../Icons';
import NumberStepper from '../shared/NumberStepper';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { BookmarkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { SavedSearch } from '../../types/profile';
import { profileService } from '../../services/profile.service';
import { decodeSearchHash } from '../../utils/searchUtils';

const initialFacilities: FacilityKey[] = [];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchRequest & { searchHash: string }) => void;
  initialSearchHash?: string;
  onFilterCountChange?: (count: number) => void;
  forceReset?: boolean;
  title?: string;
  refreshSavedSearches?: boolean;
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  onSearch, 
  initialSearchHash, 
  forceReset, 
  title = 'Search',
  refreshSavedSearches 
}: SearchModalProps) {
  const [searchParams] = useSearchParams();
  const searchHash = searchParams.get('q');
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useUser();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchRequest>({
    suburbs: [],
    radius: 0,
    paddockTypes: [],
    spaces: 0,
    maxPrice: 0,
    hasArena: false,
    hasRoundYard: false,
    facilities: initialFacilities,
    careTypes: []
  });

  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        const response = await profileService.getSavedSearches();
        // Sort by lastUpdate, most recent first
        const sortedSearches = response.savedSearches.sort((a, b) => 
          new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
        );
        setSavedSearches(sortedSearches);
      } catch (error) {
        console.error('Error loading saved searches:', error);
        toast.error('Failed to load saved searches');
      }
    };

    if (user) {
      loadSavedSearches();
    }
  }, [user, refreshSavedSearches]);

  useEffect(() => {
    if (forceReset && isOpen) {
      setSearchCriteria({
        suburbs: [],
        radius: 0,
        paddockTypes: [],
        spaces: 0,
        maxPrice: 0,
        hasArena: false,
        hasRoundYard: false,
        facilities: initialFacilities,
        careTypes: []
      });
    } else if (initialSearchHash) {
      const decodedCriteria = decodeSearchHash(initialSearchHash);
      setSearchCriteria(decodedCriteria);
    } else if (!searchHash && isOpen) {
      setSearchCriteria({
        suburbs: [],
        radius: 0,
        paddockTypes: [],
        spaces: 0,
        maxPrice: 0,
        hasArena: false,
        hasRoundYard: false,
        facilities: initialFacilities,
        careTypes: []
      });
    } else if (searchHash && isOpen) {
      try {
        setSearchCriteria(decodeSearchHash(searchHash));

      } catch (error) {
        console.error('Error decoding search hash:', error);
      }
    }
  }, [initialSearchHash, searchHash, isOpen, forceReset]);

  const togglePaddockType = (type: PaddockType) => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      paddockTypes: prev.paddockTypes.includes(type)
        ? prev.paddockTypes.filter(t => t !== type)
        : [...prev.paddockTypes, type]
    }));
  };

  const toggleCareType = (type: CareType) => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      careTypes: prev.careTypes.includes(type)
        ? prev.careTypes.filter(t => t !== type)
        : [...prev.careTypes, type]
    }));
  };

  const toggleFacility = (facility: FacilityKey) => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const toggleArena = () => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      hasArena: !prev.hasArena
    }));
  };

  const toggleRoundYard = () => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      hasRoundYard: !prev.hasRoundYard
    }));
  };

  const resetFilters = () => {
    setSearchCriteria((prev: SearchRequest) => ({
      ...prev,
      spaces: 0,
      maxPrice: 0,
      paddockTypes: [],
      hasArena: false,
      hasRoundYard: false,
      facilities: initialFacilities,
      careTypes: []
    }));
  };

  const handleSearch = async () => {
    setIsUpdating(true);
    try {
      const searchHash = btoa(JSON.stringify({
        s: searchCriteria.suburbs.map(s => ({
          i: s.id,
          n: s.suburb,
          p: s.postcode,
          t: s.state,
          r: s.region,
          g: s.geohash,
          l: s.locationType
        })),
        r: searchCriteria.radius,
        pt: searchCriteria.paddockTypes,
        sp: searchCriteria.spaces,
        mp: searchCriteria.maxPrice,
        a: searchCriteria.hasArena,
        ry: searchCriteria.hasRoundYard,
        f: searchCriteria.facilities,
        ct: searchCriteria.careTypes
      }));

      // Always execute search before closing modal
      await onSearch({ ...searchCriteria, searchHash });
    } catch (error) {
      console.error('Error executing search:', error);
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  const modalContent = (
    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} id="search-form" className="space-y-4 pb-12">
      {/* Location Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Location Search with Saved Searches Menu */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-2">
              {searchCriteria.suburbs.length === 0 ? (
                "Suburb, post code, region or state"
              ) : (
                `${searchCriteria.suburbs.length} ${searchCriteria.suburbs.length === 1 ? 'location' : 'locations'} selected`
              )}
            </label>
            <div className="flex gap-2 items-start">
              <div className="flex-grow">
                <SuburbSearch
                  selectedSuburbs={searchCriteria.suburbs}
                  onSuburbsChange={(suburbs) => {
                    setSearchCriteria((prev: SearchRequest) => ({ 
                      ...prev, 
                      suburbs,
                      radius: 0 
                    }));
                  }}
                  disabled={isUpdating}
                />
              </div>
              
              {/* Three-dot menu for saved searches */}
              <Menu as="div" className="relative">
                <MenuButton
                  className="p-2 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    if (!user) {
                      toast.error('Please sign in to save searches');
                      return;
                    }
                  }}
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </MenuButton>

                {user && (
                  <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100">
                        <BookmarkIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm text-gray-900">Saved Searches</span>
                      </div>
                      {savedSearches.map((savedSearch) => (
                        <MenuItem key={savedSearch.id}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const decodedSearch = decodeSearchHash(savedSearch.searchHash);
                                setSearchCriteria(decodedSearch);
                              }}
                              className={`${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } block w-full px-4 py-2 text-left text-sm`}
                            >
                              {savedSearch.name}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                      {(!savedSearches || savedSearches.length === 0) && (
                        <div className="px-4 py-2 text-sm text-gray-500">No saved searches</div>
                      )}
                      {user && (
                        <div className="border-t border-gray-100">
                          <MenuItem>
                            {({ active }) => (
                              <Link
                                to="/profile?section=saved-searches"
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } block w-full px-4 py-2 text-left text-sm`}
                              >
                                Manage saved searches
                              </Link>
                            )}
                          </MenuItem>
                        </div>
                      )}
                    </div>
                  </MenuItems>
                )}
              </Menu>
            </div>
          </div>

          {/* Radius */}
          <div className="pb-6 border-b border-neutral-200">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">
                Radius
              </label>
              <span className="text-lg font-semibold text-neutral-900">
                {searchCriteria.radius === 0 
                  ? 'Exact'
                  : `${searchCriteria.radius}km`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={searchCriteria.radius}
              disabled={!searchCriteria.suburbs.some((suburb: Suburb) => suburb.locationType === LocationType.SUBURB)}
              onChange={(e) => {
                const hasSuburb = searchCriteria.suburbs.some((suburb: Suburb) => suburb.locationType === LocationType.SUBURB);
                setSearchCriteria((prev: SearchRequest) => ({ 
                  ...prev, 
                  radius: hasSuburb ? parseInt(e.target.value) : 0 
                }));
              }}
              className={`w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer 
                ${!searchCriteria.suburbs.some((suburb: Suburb) => suburb.locationType === LocationType.SUBURB) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : searchCriteria.suburbs.some((suburb: Suburb) => suburb.locationType === LocationType.SUBURB)
                    ? 'accent-primary-600'
                    : ''
                }`}
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>0km</span>
              <span>50km</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Radius search will only be available when a suburb is selected
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetFilters();
            }}
            disabled={searchCriteria.spaces === 0 &&
              searchCriteria.maxPrice === 0 &&
              searchCriteria.paddockTypes.length === 0 &&
              !searchCriteria.hasArena &&
              !searchCriteria.hasRoundYard &&
              searchCriteria.facilities.length === 0 &&
              searchCriteria.careTypes.length === 0}
            className={`text-sm font-medium text-neutral-700 hover:text-neutral-900 ${searchCriteria.spaces === 0 &&
                searchCriteria.maxPrice === 0 &&
                searchCriteria.paddockTypes.length === 0 &&
                !searchCriteria.hasArena &&
                !searchCriteria.hasRoundYard &&
                searchCriteria.facilities.length === 0 &&
                searchCriteria.careTypes.length === 0
                ? 'cursor-not-allowed'
                : ''
              }`}
          >
            Reset Filters
          </button>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {/* Number of Horses */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Number of Horses
            </label>
            <NumberStepper
              value={searchCriteria.spaces}
              onChange={(value) => setSearchCriteria((prev: SearchRequest) => ({ ...prev, spaces: value }))} 
              min={0}
              max={10}
              disabled={searchCriteria.suburbs.length === 0}
              formatValue={(value) => value === 0 ? 'Any' : value === 10 ? '10+' : value.toString()}
            />
          </div>

          {/* Maximum Weekly Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">
                Max price per space
              </label>
              <span className="text-lg font-semibold text-neutral-900">
                {searchCriteria.maxPrice === 0 ? 'Any' : searchCriteria.maxPrice === 300 ? '$300+/week' : `$${searchCriteria.maxPrice}/week`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              disabled={searchCriteria.suburbs.length === 0}
              value={searchCriteria.maxPrice}
              onChange={(e) => setSearchCriteria((prev: SearchRequest) => ({ ...prev, maxPrice: parseInt(e.target.value) }))} 
              className={`w-full h-2 bg-neutral-200 rounded-lg appearance-none ${searchCriteria.suburbs.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer accent-primary-600'
              }`}
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Any</span>
              <span>$300+/week</span>
            </div>
          </div>

          {/* Paddock Types */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Paddock Types</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['Private', 'Shared', 'Group'] as PaddockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => togglePaddockType(type)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.paddockTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Care Options */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Care Options</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['Self', 'Part', 'Full'] as CareType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => toggleCareType(type)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.careTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {type} Care
                </button>
              ))}
            </div>
          </div>

          {/* Riding Facilities */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Riding Facilities</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={toggleArena}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.hasArena
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                  } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Arena
              </button>
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={toggleRoundYard}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.hasRoundYard
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                  } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Round Yard
              </button>
            </div>
          </div>

          {/* Additional Facilities */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Property Facilities</h2>
            <div className="grid grid-cols-2 gap-2">
              {[/* eslint-disable @typescript-eslint/naming-convention */
                { key: 'feedRoom', icon: FeedRoomIcon, label: 'Feed Room' },
                { key: 'tackRoom', icon: TackRoomIcon, label: 'Tack Room' },
                { key: 'floatParking', icon: FloatParkingIcon, label: 'Float' },
                { key: 'hotWash', icon: HotWashIcon, label: 'Hot Wash' },
                { key: 'stables', icon: StableIcon, label: 'Stables' },
                { key: 'tieUp', icon: TieUpIcon, label: 'Tie Up' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => toggleFacility(key as FacilityKey)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.facilities.includes(key as FacilityKey)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200">
        <button
          type="submit"
          disabled={searchCriteria.suburbs.length === 0 || isUpdating}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
            ${searchCriteria.suburbs.length === 0 || isUpdating
              ? 'bg-neutral-300 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
            }`}
        >
          {isUpdating ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton
      size="md"
      slideFrom="right"
      isUpdating={isUpdating}
      actionIconType="SEARCH"
      onAction={handleSearch}
    >
      {modalContent}
    </Modal>
  );
}
