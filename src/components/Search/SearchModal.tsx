import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, FacilityType } from '../../types/search';
import { LocationType } from '../../types/suburb';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MinusIcon,
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon
} from '../Icons';

const initialFacilities: FacilityType[] = [];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria & { searchHash: string }) => void;
  initialSearchHash?: string;
  onFilterCountChange?: (count: number) => void;
}

export function SearchModal({ isOpen, onClose, onSearch, initialSearchHash }: SearchModalProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchHash = searchParams.get('q') || initialSearchHash;

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
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

  const decodeSearchHash = (hash: string): SearchCriteria => {
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
    if (!searchHash && isOpen) {
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
  }, [searchHash, isOpen]);

  const togglePaddockType = (type: PaddockType) => {
    setSearchCriteria(prev => ({
      ...prev,
      paddockTypes: prev.paddockTypes.includes(type)
        ? prev.paddockTypes.filter(t => t !== type)
        : [...prev.paddockTypes, type]
    }));
  };

  const toggleCareType = (type: CareType) => {
    setSearchCriteria(prev => ({
      ...prev,
      careTypes: prev.careTypes.includes(type)
        ? prev.careTypes.filter(t => t !== type)
        : [...prev.careTypes, type]
    }));
  };

  const toggleFacility = (facility: FacilityType) => {
    setSearchCriteria(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const toggleArena = () => {
    setSearchCriteria(prev => ({
      ...prev,
      hasArena: !prev.hasArena
    }));
  };

  const toggleRoundYard = () => {
    setSearchCriteria(prev => ({
      ...prev,
      hasRoundYard: !prev.hasRoundYard
    }));
  };

  const resetFilters = () => {
    setSearchCriteria(prev => ({
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

  const handleSearch = () => {

    // Create the search hash
    const searchData = {
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
    };

    const hash = btoa(JSON.stringify(searchData));

    // If not on agistments page, navigate there
    if (!location.pathname.includes('/agistments')) {
      navigate(`/agistments/search?q=${hash}`);
    } else {
      // Update URL without navigation if already on agistments page
      navigate(`?q=${hash}`, { replace: true });
    }

    onSearch({ ...searchCriteria, searchHash: hash });
    onClose();
  };

  const modalContent = (
    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} id="search-form" className="space-y-4">
      {/* Location Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Location</h2>

        {/* Location Search */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
              {searchCriteria.suburbs.length === 0 ? (
                "Select at least one location"
              ) : (
                `${searchCriteria.suburbs.length} ${searchCriteria.suburbs.length === 1 ? 'location' : 'locations'} selected`
              )}
            </label>
            <SuburbSearch
              selectedSuburbs={searchCriteria.suburbs}
              onSuburbsChange={(suburbs) => setSearchCriteria(prev => ({ ...prev, suburbs }))}
            />
          </div>

          {/* Radius */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Radius
              </label>
              <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                {searchCriteria.radius === 0 ? 'Any' : `${searchCriteria.radius}km`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={searchCriteria.radius}
              disabled={!searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB)}
              onChange={(e) => setSearchCriteria(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className={`w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${!searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>0km</span>
              <span>50km</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Radius search will only be available when a suburb is selected
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700" />

      {/* Filters Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filters</h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetFilters();
            }}
            disabled={
              searchCriteria.spaces === 0 &&
              searchCriteria.maxPrice === 0 &&
              searchCriteria.paddockTypes.length === 0 &&
              !searchCriteria.hasArena &&
              !searchCriteria.hasRoundYard &&
              searchCriteria.facilities.length === 0 &&
              searchCriteria.careTypes.length === 0
            }
            className={`text-sm transition-colors ${searchCriteria.spaces === 0 &&
                searchCriteria.maxPrice === 0 &&
                searchCriteria.paddockTypes.length === 0 &&
                !searchCriteria.hasArena &&
                !searchCriteria.hasRoundYard &&
                searchCriteria.facilities.length === 0 &&
                searchCriteria.careTypes.length === 0
                ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                : 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
              }`}
          >
            Reset Filters
          </button>
        </div>
        <div className="space-y-4">
          {/* Number of Spaces */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Number of spaces
            </label>
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={() => setSearchCriteria(prev => ({ ...prev, spaces: Math.max(0, prev.spaces - 1) }))}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white min-w-[3ch] text-center">
                {searchCriteria.spaces === 0 ? 'Any' : searchCriteria.spaces < 10 ? searchCriteria.spaces : '10+'}
              </div>
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={() => setSearchCriteria(prev => ({ ...prev, spaces: Math.min(10, prev.spaces + 1) }))}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Maximum Weekly Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Max price per space
              </label>
              <span className="text-lg font-semibold text-neutral-900 dark:text-white">
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
              onChange={(e) => setSearchCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
              className={`w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>Any</span>
              <span>$300+/week</span>
            </div>
          </div>

          {/* Paddock Types */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Paddock Types
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Private', 'Shared', 'Group'] as PaddockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => togglePaddockType(type)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.paddockTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Arena and Round Yard */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Riding Facilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={toggleArena}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.hasArena
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                  } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ArenaIcon className="h-5 w-5" />
                Arena
              </button>
              <button
                type="button"
                disabled={searchCriteria.suburbs.length === 0}
                onClick={toggleRoundYard}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.hasRoundYard
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                  } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <RoundYardIcon className="h-5 w-5" />
                Round Yard
              </button>
            </div>
          </div>

          {/* Additional Facilities */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Additional Facilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[/* eslint-disable @typescript-eslint/naming-convention */
                { key: 'feedRoom' as FacilityType, icon: FeedRoomIcon, label: 'Feed Room' },
                { key: 'tackRoom' as FacilityType, icon: TackRoomIcon, label: 'Tack Room' },
                { key: 'floatParking' as FacilityType, icon: FloatParkingIcon, label: 'Float' },
                { key: 'hotWash' as FacilityType, icon: HotWashIcon, label: 'Hot Wash' },
                { key: 'stable' as FacilityType, icon: StableIcon, label: 'Stable' },
                { key: 'tieUp' as FacilityType, icon: TieUpIcon, label: 'Tie Up' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => toggleFacility(key)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.facilities.includes(key)
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Care Types */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Care Types
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Self', 'Part', 'Full'] as CareType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={() => toggleCareType(type)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.careTypes.includes(type)
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );

  const footerContent = (
    <div className="flex justify-end">
      <button
        type="submit"
        form="search-form"
        disabled={searchCriteria.suburbs.length === 0}
        className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${searchCriteria.suburbs.length === 0
            ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400'
          }`}
      >
        Search Agistments
      </button>
    </div>
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Agistment"
      size="md"
      slideFrom="left"
      footerContent={footerContent}

    >
      <div className="px-4 py-3">
        {modalContent}
      </div>
    </Modal>
  );
}
