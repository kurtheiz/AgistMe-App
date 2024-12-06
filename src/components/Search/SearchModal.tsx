import React, { useState, useEffect } from 'react';
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
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useProfile } from '../../context/ProfileContext';
import toast from 'react-hot-toast';

const initialFacilities: FacilityKey[] = [];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchRequest & { searchHash: string }) => void;
  initialSearchHash?: string;
  onFilterCountChange?: (count: number) => void;
  forceReset?: boolean;
  title?: string;
}

export function SearchModal({ isOpen, onClose, onSearch, initialSearchHash, forceReset, title = 'Search' }: SearchModalProps) {
  const [searchParams] = useSearchParams();
  const searchHash = searchParams.get('q');
  const [isUpdating, setIsUpdating] = useState(false);
  const { profile } = useProfile();

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

  const decodeSearchHash = (hash: string): SearchRequest => {
    try {
      const decodedSearch = JSON.parse(atob(hash));
      console.log(decodedSearch);
      return {
        suburbs: decodedSearch.s?.map((s: any) => ({
          id: s.i,
          suburb: s.n,
          postcode: s.p,
          state: s.t,
          region: s.r,
          geohash: s.g,
          locationType: s.l
        })) || [],
        radius: decodedSearch.r || 0,
        paddockTypes: decodedSearch.pt || [],
        spaces: decodedSearch.sp || 0,
        maxPrice: decodedSearch.mp || 0,
        hasArena: decodedSearch.a || false,
        hasRoundYard: decodedSearch.ry || false,
        facilities: decodedSearch.f || initialFacilities,
        careTypes: decodedSearch.ct || []
      };
    } catch (error) {
      console.error('Error decoding search hash:', error);
      return {
        suburbs: [],
        radius: 0,
        paddockTypes: [],
        spaces: 0,
        maxPrice: 0,
        hasArena: false,
        hasRoundYard: false,
        facilities: initialFacilities,
        careTypes: []
      };
    }
  };

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
        {/* Saved Searches Dropdown */}
        <div className="w-full">
          <Menu as="div" className="relative inline-block text-left w-full">
            {({ open }) => (
              <>
                <Menu.Button 
                  className="inline-flex w-full justify-between rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    if (!profile) {
                      toast.error('Please sign in to use saved searches');
                    }
                  }}
                >
                  {profile?.savedSearches?.find(search => decodeSearchHash(search.searchHash).suburbs.every(s => 
                    searchCriteria.suburbs.some(cs => cs.id === s.id)) && 
                    decodeSearchHash(search.searchHash).radius === searchCriteria.radius &&
                    decodeSearchHash(search.searchHash).paddockTypes.every(pt => searchCriteria.paddockTypes.includes(pt)) &&
                    decodeSearchHash(search.searchHash).spaces === searchCriteria.spaces &&
                    decodeSearchHash(search.searchHash).maxPrice === searchCriteria.maxPrice &&
                    decodeSearchHash(search.searchHash).hasArena === searchCriteria.hasArena &&
                    decodeSearchHash(search.searchHash).hasRoundYard === searchCriteria.hasRoundYard &&
                    decodeSearchHash(search.searchHash).facilities.every(f => searchCriteria.facilities.includes(f)) &&
                    decodeSearchHash(search.searchHash).careTypes.every(ct => searchCriteria.careTypes.includes(ct)))?.name || 'Load Saved Search'}
                  <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                {profile && (
                  <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {profile?.savedSearches?.map((savedSearch) => (
                        <Menu.Item key={savedSearch.id}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const decodedCriteria = decodeSearchHash(savedSearch.searchHash);
                                setSearchCriteria(decodedCriteria);
                              }}
                              className={`${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } block px-4 py-2 text-sm w-full text-left`}
                            >
                              {savedSearch.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                      {(!profile?.savedSearches || profile.savedSearches.length === 0) && (
                        <div className="px-4 py-2 text-sm text-gray-500">No saved searches</div>
                      )}
                    </div>
                  </Menu.Items>
                )}
              </>
            )}
          </Menu>
          {profile && (
            <p className="mt-1 text-xs text-gray-500 text-center">
              Visit your <Link to="/profile" className="text-primary-600 hover:text-primary-700">profile</Link> to manage saved searches
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">Location</h2>

          {/* Location Search */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-2">
                {searchCriteria.suburbs.length === 0 ? (
                  "Select at least one location"
                ) : (
                  `${searchCriteria.suburbs.length} ${searchCriteria.suburbs.length === 1 ? 'location' : 'locations'} selected`
                )}
              </label>
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

            {/* Radius */}
            <div className="pb-6 border-b border-neutral-200">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Radius
                </label>
                <span className="text-lg font-semibold text-neutral-900">
                  {!searchCriteria.suburbs.some((suburb: Suburb) => suburb.locationType === LocationType.SUBURB) 
                    ? 'Any' 
                    : searchCriteria.radius === 0 
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
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      actionIconType="SEARCH"
      onAction={handleSearch}
      disableAction={searchCriteria.suburbs.length === 0}
      isUpdating={isUpdating}
    >
      {modalContent}
    </Modal>
  );
}
