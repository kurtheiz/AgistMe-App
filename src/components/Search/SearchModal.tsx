import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, FacilityType } from '../../types/search';
import { LocationType } from '../../types/suburb';
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
  TieUpIcon,
  HeartIcon
} from '../Icons';
import { useNavigate } from 'react-router-dom';

const initialFacilities: FacilityType[] = [];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
  initialSearchHash?: string;
}

export function SearchModal({ isOpen, onClose, onSearch, initialSearchHash }: SearchModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Only add padding if there's a scrollbar
      const hasScrollbar = window.innerHeight < document.documentElement.scrollHeight;
      if (hasScrollbar) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.documentElement.style.setProperty('--scrollbar-width', '0px');
        document.body.style.paddingRight = '0px';
      }
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('overflow-hidden');
    } else {
      const transitionDuration = 200;
      setTimeout(() => {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('overflow-hidden');
        document.body.style.paddingRight = '';
        document.documentElement.style.setProperty('--scrollbar-width', '0px');
      }, transitionDuration);
    }

    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('overflow-hidden');
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    };
  }, [isOpen]);

  const decodeSearchHash = (hash: string): SearchCriteria => {
    try {
      const decodedSearch = JSON.parse(atob(hash));
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

  const [criteria, setCriteria] = useState<SearchCriteria>(() => 
    initialSearchHash ? decodeSearchHash(initialSearchHash) : {
      suburbs: [],
      radius: 0,
      paddockTypes: [],
      spaces: 0,
      maxPrice: 0,
      hasArena: false,
      hasRoundYard: false,
      facilities: initialFacilities,
      careTypes: []
    }
  );

  useEffect(() => {
    if (initialSearchHash) {
      setCriteria(decodeSearchHash(initialSearchHash));
    }
  }, [initialSearchHash]);

  const navigate = useNavigate();

  const togglePaddockType = (type: PaddockType) => {
    setCriteria(prev => ({
      ...prev,
      paddockTypes: prev.paddockTypes.includes(type)
        ? prev.paddockTypes.filter(t => t !== type)
        : [...prev.paddockTypes, type]
    }));
  };

  const toggleCareType = (type: CareType) => {
    setCriteria(prev => ({
      ...prev,
      careTypes: prev.careTypes.includes(type)
        ? prev.careTypes.filter(t => t !== type)
        : [...prev.careTypes, type]
    }));
  };

  const toggleFacility = (facility: FacilityType) => {
    setCriteria(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const toggleArena = () => {
    setCriteria(prev => ({
      ...prev,
      hasArena: !prev.hasArena
    }));
  };

  const toggleRoundYard = () => {
    setCriteria(prev => ({
      ...prev,
      hasRoundYard: !prev.hasRoundYard
    }));
  };

  const resetFilters = () => {
    setCriteria(prev => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up suburbs based on selected regions and states
    let cleanedSuburbs = [...criteria.suburbs];
    
    // Remove any location if its ID starts with another selected location's ID
    cleanedSuburbs = cleanedSuburbs.filter(suburb => {
      // Check if any other selected location's ID is a prefix of this suburb's ID
      return !cleanedSuburbs.some(other => 
        other !== suburb && // Don't compare with itself
        suburb.id.startsWith(other.id) // Check if other.id is a prefix
      );
    });

    // Create a compact search object
    const compactSearch = {
      s: cleanedSuburbs.map(s => ({
        i: s.id,
        n: s.suburb,
        p: s.postcode,
        t: s.state,
        r: s.region,
        g: s.geohash,
        l: s.locationType
      })),
      r: criteria.radius,
      sp: criteria.spaces,
      mp: criteria.maxPrice,
      pt: criteria.paddockTypes,
      ct: criteria.careTypes,
      f: criteria.facilities,
      a: criteria.hasArena,
      ry: criteria.hasRoundYard
    };

    // Convert to base64 string
    const searchHash = btoa(JSON.stringify(compactSearch));
    
    // Ensure all required fields are included in the search criteria
    const searchCriteria: SearchCriteria = {
      ...criteria,
      suburbs: cleanedSuburbs,
      hasArena: criteria.hasArena || false,
      hasRoundYard: criteria.hasRoundYard || false,
      facilities: criteria.facilities || [],
      careTypes: criteria.careTypes || []
    };
    
    onSearch(searchCriteria);
    navigate(`/agistments/search?q=${searchHash}`);
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
          <div className="flex min-h-screen items-center justify-center md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                className="fixed left-0 md:left-auto w-full h-full md:h-auto md:min-h-0 md:max-w-md transform bg-white dark:bg-neutral-800 md:rounded-2xl text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white bg-primary-600 flex justify-between items-center p-4 md:rounded-t-2xl"
                    >
                      <span>Search Agistment</span>
                      <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-primary-700 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5 text-white" />
                      </button>
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="pb-20">
                      {/* Location Section */}
                      <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Location</h2>
                        
                        {/* Location Search */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                              {criteria.suburbs.length === 0 ? (
                                "Select at least one location"
                              ) : (
                                `${criteria.suburbs.length} ${criteria.suburbs.length === 1 ? 'location' : 'locations'} selected`
                              )}
                            </label>
                            <SuburbSearch
                              selectedSuburbs={criteria.suburbs}
                              onSuburbsChange={(suburbs) => setCriteria(prev => ({ ...prev, suburbs }))}
                            />
                          </div>

                          {/* Radius */}
                          {criteria.suburbs.some(suburb => suburb.locationType && suburb.locationType === LocationType.SUBURB) && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                  Radius
                                </label>
                                <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                                  {criteria.radius === 0 ? 'Any' : `${criteria.radius}km`}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="50"
                                value={criteria.radius}
                                onChange={(e) => setCriteria(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                <span>0km</span>
                                <span>50km</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700" />

                      {/* Filters Section */}
                      <div className="p-4 sm:p-6 pb-0">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filters</h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              resetFilters();
                            }}
                            disabled={
                              criteria.spaces === 0 &&
                              criteria.maxPrice === 0 &&
                              criteria.paddockTypes.length === 0 &&
                              !criteria.hasArena &&
                              !criteria.hasRoundYard &&
                              criteria.facilities.length === 0 &&
                              criteria.careTypes.length === 0
                            }
                            className={`text-sm transition-colors ${
                              criteria.spaces === 0 &&
                              criteria.maxPrice === 0 &&
                              criteria.paddockTypes.length === 0 &&
                              !criteria.hasArena &&
                              !criteria.hasRoundYard &&
                              criteria.facilities.length === 0 &&
                              criteria.careTypes.length === 0
                                ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                                : 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                            }`}
                          >
                            Reset Filters
                          </button>
                        </div>
                        <div className="space-y-6 mb-0">
                          {/* Number of Spaces */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Number of spaces
                            </label>
                            <div className="flex items-center justify-center space-x-4">
                              <button
                                type="button"
                                disabled={criteria.suburbs.length === 0}
                                onClick={() => setCriteria(prev => ({ ...prev, spaces: Math.max(0, prev.spaces - 1) }))}
                                className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                  criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                <MinusIcon className="h-5 w-5" />
                              </button>
                              <div className="text-3xl font-semibold text-neutral-900 dark:text-white min-w-[3ch] text-center">
                                {criteria.spaces === 0 ? 'Any' : criteria.spaces < 10 ? criteria.spaces : '10+'}
                              </div>
                              <button
                                type="button"
                                disabled={criteria.suburbs.length === 0}
                                onClick={() => setCriteria(prev => ({ ...prev, spaces: Math.min(10, prev.spaces + 1) }))}
                                className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                                  criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                                {criteria.maxPrice === 0 ? 'Any' : criteria.maxPrice === 300 ? '$300+/week' : `$${criteria.maxPrice}/week`}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="300"
                              step="10"
                              disabled={criteria.suburbs.length === 0}
                              value={criteria.maxPrice}
                              onChange={(e) => setCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                              className={`w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none ${
                                criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                                  disabled={criteria.suburbs.length === 0}
                                  onClick={() => togglePaddockType(type)}
                                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    criteria.paddockTypes.includes(type)
                                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                                  } ${criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                disabled={criteria.suburbs.length === 0}
                                onClick={toggleArena}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                  criteria.hasArena
                                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                                } ${criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <ArenaIcon className="h-5 w-5" />
                                Arena
                              </button>
                              <button
                                type="button"
                                disabled={criteria.suburbs.length === 0}
                                onClick={toggleRoundYard}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                  criteria.hasRoundYard
                                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                                } ${criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                  disabled={criteria.suburbs.length === 0}
                                  onClick={() => toggleFacility(key)}
                                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    criteria.facilities.includes(key)
                                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                                  } ${criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <Icon className="h-5 w-5" />
                                  {label}
                                </button>
                               ))}
                            </div>
                          </div>

                          {/* Care Types */}
                          <div className="mb-0">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Care Types
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['Self', 'Part', 'Full'] as CareType[]).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  disabled={criteria.suburbs.length === 0}
                                  onClick={() => toggleCareType(type)}
                                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    criteria.careTypes.includes(type)
                                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-primary-600 dark:hover:border-primary-500'
                                  } ${criteria.suburbs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <HeartIcon className="h-5 w-5" />
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 absolute bottom-0 left-0 right-0">
                    <button
                      type="submit"
                      disabled={criteria.suburbs.length === 0}
                      className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                        criteria.suburbs.length === 0 
                          ? 'bg-neutral-400 cursor-not-allowed' 
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      Search
                    </button>
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
