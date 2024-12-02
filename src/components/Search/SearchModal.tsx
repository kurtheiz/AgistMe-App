import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, FacilityType } from '../../types/search';
import { LocationType } from '../../types/suburb';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArenaIcon,
  RoundYardIcon,
  FeedRoomIcon,
  TackRoomIcon,
  FloatParkingIcon,
  HotWashIcon,
  StableIcon,
  TieUpIcon
} from '../Icons';
import NumberStepper from '../shared/NumberStepper';

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
      <div className="space-y-4 sm:space-y-6">
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
                setSearchCriteria(prev => ({ 
                  ...prev, 
                  suburbs,
                  radius: 0 // Always set to 0 when suburbs change
                }));
              }}
            />
          </div>

          {/* Radius */}
          <div className="pb-6 border-b border-neutral-200">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">
                Radius
              </label>
              <span className="text-lg font-semibold text-neutral-900">
                {!searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB) ? 'Any' : searchCriteria.radius === 0 ? 'Any' : `${searchCriteria.radius}km`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={searchCriteria.radius}
              disabled={!searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB)}
              onChange={(e) => {
                const hasSuburb = searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB);
                setSearchCriteria(prev => ({ 
                  ...prev, 
                  radius: hasSuburb ? parseInt(e.target.value) : 0 
                }));
              }}
              className={`w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer 
                ${!searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB)
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
            disabled={
              searchCriteria.spaces === 0 &&
              searchCriteria.maxPrice === 0 &&
              searchCriteria.paddockTypes.length === 0 &&
              !searchCriteria.hasArena &&
              !searchCriteria.hasRoundYard &&
              searchCriteria.facilities.length === 0 &&
              searchCriteria.careTypes.length === 0
            }
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
              onChange={(value) => setSearchCriteria(prev => ({ ...prev, spaces: value }))}
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
              onChange={(e) => setSearchCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
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

          {/* Paddock Types and Riding Facilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paddock Types */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Paddock Type</h2>
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

            {/* Riding Facilities */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Riding Facilities</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={searchCriteria.suburbs.length === 0}
                  onClick={toggleArena}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${searchCriteria.hasArena
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
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
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-600'
                    } ${searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <RoundYardIcon className="h-5 w-5" />
                  Round Yard
                </button>
              </div>
            </div>
          </div>

          {/* Care Types */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Care Type</h2>
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

          {/* Additional Facilities */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Facilities</h2>
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
    </form>
  );

  const footerContent = (
    <div className="flex justify-end">
      <button
        type="submit"
        form="search-form"
        disabled={searchCriteria.suburbs.length === 0}
        className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${searchCriteria.suburbs.length === 0
            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
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
      title="Search"
      size="wide"
      slideFrom="left"
      footerContent={footerContent}
      isUpdating={false}
    >
      <div className="px-4 py-3">
        {modalContent}
      </div>
    </Modal>
  );
}
