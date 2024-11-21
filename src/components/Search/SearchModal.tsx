import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SuburbSearch } from '../SuburbSearch/SuburbSearch';
import { SearchCriteria, PaddockType, CareType, Facility } from '../../types/search';
import { XIcon, PlusIcon, MinusIcon } from '../Icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
}

const initialFacilities: Facility = {
  feedRoom: false,
  tackRoom: false,
  floatParking: false,
  hotWash: false,
  tieUp: false,
  stable: false,
};

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    suburbs: [],
    radius: 0,
    paddockType: 'Private',
    spaces: 1,
    maxPrice: 100,
    hasArena: false,
    hasRoundYard: false,
    facilities: initialFacilities,
    careType: 'Self',
  });

  const handleSuburbSelect = (suburbs: any[]) => {
    setCriteria(prev => ({ ...prev, suburbs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
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

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-6 p-4 sm:p-6 sm:pr-8">
                    {/* Suburb Search */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Location
                      </label>
                      <SuburbSearch
                        onSelect={handleSuburbSelect}
                        multiple={true}
                      />
                    </div>

                    {/* Radius Selector (only if suburbs are selected) */}
                    {criteria.suburbs.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Search Radius (km)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="70"
                          value={criteria.radius}
                          onChange={(e) => setCriteria(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {criteria.radius} km
                        </div>
                      </div>
                    )}

                    {/* Paddock Type */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Paddock Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Private', 'Shared', 'Group'] as PaddockType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCriteria(prev => ({ ...prev, paddockType: type }))}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              criteria.paddockType === type
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Spaces */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Number of Spaces
                      </label>
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          type="button"
                          onClick={() => setCriteria(prev => ({ ...prev, spaces: Math.max(1, prev.spaces - 1) }))}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <div className="text-3xl font-semibold text-neutral-900 dark:text-white min-w-[3ch] text-center">
                          {criteria.spaces < 10 ? criteria.spaces : '10+'}
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
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Maximum Weekly Price per Space
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-[11px] text-neutral-500">$</span>
                        <input
                          type="number"
                          min="0"
                          value={criteria.maxPrice}
                          onChange={(e) => setCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                          className="form-input form-input-compact pl-7"
                        />
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

                    {/* Care Type */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Care Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Full', 'Part', 'Self'] as CareType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCriteria(prev => ({ ...prev, careType: type }))}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              criteria.careType === type
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-700 sticky bottom-0 bg-white dark:bg-neutral-800">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Search
                    </button>
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
