import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, FacilityType } from '../../types/search';
import { LocationType } from '../../types/suburb';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  XMarkIcon,
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

export function SearchModal({ isOpen, onClose, onSearch, initialSearchHash, onFilterCountChange }: SearchModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      // Check if content will cause overflow
      const modalContent = document.querySelector('[role="dialog"]');
      const hasScrollbar = modalContent && modalContent.scrollHeight > window.innerHeight;
      
      if (hasScrollbar) {
        // Only add padding if there's actually a scrollbar
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('overflow-hidden');
    } else {
      // Clean up immediately instead of using setTimeout
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('overflow-hidden');
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    }

    // Cleanup function
    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('overflow-hidden');
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchHash && isOpen) {
      try {
        const decodedSearch = JSON.parse(atob(searchHash));
        setSearchCriteria({
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
        });
      } catch (error) {
        console.error('Error decoding search hash:', error);
      }
    }
  }, [searchHash, isOpen]);

  useEffect(() => {
    const filterCount = 
      searchCriteria.paddockTypes.length + 
      (searchCriteria.spaces > 0 ? 1 : 0) +
      (searchCriteria.maxPrice > 0 ? 1 : 0) +
      (searchCriteria.hasArena ? 1 : 0) +
      (searchCriteria.hasRoundYard ? 1 : 0) +
      searchCriteria.facilities.length +
      searchCriteria.careTypes.length;
    
    onFilterCountChange?.(filterCount);
  }, [searchCriteria, onFilterCountChange]);

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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0" 
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="modal-panel w-full h-full md:max-w-md md:h-[85vh] md:rounded-lg overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="sticky top-0 z-50 bg-primary-500 dark:bg-primary-600 border-b border-primary-600 dark:border-primary-700">
                    <div className="flex items-center justify-between px-4 py-4">
                      <Dialog.Title as="h3" className="text-lg font-medium text-white">
                        Search Agistment
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="rounded-md p-2 text-primary-100 hover:text-white dark:text-primary-200 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-primary-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="px-4 py-3">
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
                                className={`w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${
                                  !searchCriteria.suburbs.some(suburb => suburb.locationType === LocationType.SUBURB) ? 'opacity-50 cursor-not-allowed' : ''
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
                              className={`text-sm transition-colors ${
                                searchCriteria.spaces === 0 &&
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
                                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                    searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                    searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                                className={`w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none ${
                                  searchCriteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                      searchCriteria.paddockTypes.includes(type)
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
                                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    searchCriteria.hasArena
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
                                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    searchCriteria.hasRoundYard
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
                                {[
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
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                      searchCriteria.facilities.includes(key)
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
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                      searchCriteria.careTypes.includes(type)
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
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="sticky bottom-0 z-50 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="p-4">
                      <button
                        type="submit"
                        form="search-form"
                        disabled={searchCriteria.suburbs.length === 0}
                        className={`w-full inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                          searchCriteria.suburbs.length === 0
                            ? 'bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors`}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
