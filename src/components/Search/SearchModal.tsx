import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, Facility } from '../../types/search';
import { LocationType } from '../../types/suburb';
import { XIcon, PlusIcon, MinusIcon } from '../Icons';

const initialFacilities: Facility = {
  feedRoom: false,
  tackRoom: false,
  floatParking: false,
  hotWash: false,
  tieUp: false,
  stable: false,
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    suburbs: [],
    radius: 0,
    paddockTypes: [],
    spaces: 0,
    maxPrice: 0,
    hasArena: false,
    hasRoundYard: false,
    facilities: initialFacilities,
    careTypes: [],
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
    onClose();
  };

  const handleReset = () => {
    setCriteria(prev => ({
      ...prev,
      suburbs: prev.suburbs,
      radius: prev.radius,
      paddockTypes: [],
      spaces: 0,
      maxPrice: 0,
      hasArena: false,
      hasRoundYard: false,
      facilities: initialFacilities,
      careTypes: [],
    }));
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
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full max-w-md transform overflow-hidden bg-white dark:bg-neutral-800 text-left align-middle shadow-xl transition-all flex flex-col sm:rounded-2xl sm:max-h-[90vh] fixed sm:relative inset-0 sm:inset-auto">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-neutral-900 dark:text-white flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700"
                >
                  Search Agistment
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <XIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="h-full">
                  <div className="h-full overflow-y-auto">
                    {/* Location Section */}
                    <div className="p-4 sm:p-6">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Location</h2>
                      
                      {/* Location Search */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                            {criteria.suburbs.length === 0 ? (
                              "Location"
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                              Radius <span className="text-neutral-500 dark:text-neutral-400">{criteria.radius}km</span>
                            </label>
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
                    <div className="p-4 sm:p-6">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Filters</h2>
                      <div className="space-y-6">
                        {/* Number of Spaces */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Number of Spaces
                          </label>
                          <div className="flex items-center justify-center space-x-4">
                            <button
                              type="button"
                              onClick={() => setCriteria(prev => ({ ...prev, spaces: Math.max(0, prev.spaces - 1) }))}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              <MinusIcon className="h-5 w-5" />
                            </button>
                            <div className="text-3xl font-semibold text-neutral-900 dark:text-white min-w-[3ch] text-center">
                              {criteria.spaces === 0 ? 'Any' : criteria.spaces < 10 ? criteria.spaces : '10+'}
                            </div>
                            <button
                              type="button"
                              onClick={() => setCriteria(prev => ({ ...prev, spaces: Math.min(10, prev.spaces + 1) }))}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              <PlusIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Maximum Weekly Price */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                            Max Price per Space <span className="text-neutral-500 dark:text-neutral-400">
                              {criteria.maxPrice === 0 ? 'Any' : criteria.maxPrice === 300 ? '$300+/week' : `$${criteria.maxPrice}/week`}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="300"
                            step="10"
                            value={criteria.maxPrice}
                            onChange={(e) => setCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
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
                                onClick={() => togglePaddockType(type)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  criteria.paddockTypes.includes(type)
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                                    : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Arena and Round Yard */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Facilities Available
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={criteria.hasArena}
                                onChange={(e) => setCriteria(prev => ({ ...prev, hasArena: e.target.checked }))}
                                className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Arena</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={criteria.hasRoundYard}
                                onChange={(e) => setCriteria(prev => ({ ...prev, hasRoundYard: e.target.checked }))}
                                className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Round Yard</span>
                            </label>
                          </div>
                        </div>

                        {/* Additional Facilities */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Additional Facilities
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(criteria.facilities).map(([key, value]) => (
                              <label key={key} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => setCriteria(prev => ({
                                    ...prev,
                                    facilities: {
                                      ...prev.facilities,
                                      [key]: e.target.checked
                                    }
                                  }))}
                                  className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Care Types */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Care Types
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Full', 'Part', 'Self'] as CareType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => toggleCareType(type)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  criteria.careTypes.includes(type)
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                                    : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-700 sticky bottom-0 bg-white dark:bg-neutral-800">
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        Reset Filters
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
