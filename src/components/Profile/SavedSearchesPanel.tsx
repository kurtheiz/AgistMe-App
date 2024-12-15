import { Bookmark, ChevronDown, MoreVertical, Bell } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, Transition, MenuItem } from '@headlessui/react';
import { useRef, useState, useEffect } from 'react';
import { SavedSearch } from '../../types/profile';
import { encodeSearchHash } from '../../utils/searchHashUtils';

interface SavedSearchesPanelProps {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  isDefaultOpen?: boolean;
  onNavigate: (searchHash: string) => void;
  onEdit: (search: SavedSearch) => void;
  onDelete: (searchId: string, e: React.MouseEvent) => void;
}

export function SavedSearchesPanel({
  savedSearches,
  isLoading,
  isDefaultOpen = false,
  onNavigate,
  onEdit,
  onDelete
}: SavedSearchesPanelProps) {
  return (
    <div id="saved-searches-section">
      <Disclosure defaultOpen={isDefaultOpen}>
        {({ open }) => (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <DisclosureButton className={`w-full px-4 py-4 text-left flex justify-between items-center ${open ? 'rounded-t-lg' : 'rounded-lg'}`}>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-neutral-500" />
                <span className="text-lg font-medium">Saved Searches</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-6 pb-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-neutral-600">Loading saved searches...</div>
                ) : !savedSearches || savedSearches.length === 0 ? (
                  <div className="text-neutral-600">No saved searches yet</div>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((search, index) => {
                      const searchCriteria = search.searchCriteria;
                      const location = searchCriteria.suburbs?.[0];
                      let locationDisplay = 'Any location';
                      
                      if (location?.locationType) {
                        const type = location.locationType.toLowerCase();
                        if (type === 'suburb') {
                          locationDisplay = `${location.suburb}, ${location.postcode} ${location.state}`;
                        } else if (type === 'state') {
                          locationDisplay = location.state;
                        } else if (type === 'region') {
                          locationDisplay = `${location.region}, ${location.state}`;
                        }
                        
                        if (searchCriteria.radius && searchCriteria.radius > 0) {
                          locationDisplay += ` within ${searchCriteria.radius}km`;
                        }
                      }

                      const filterCount = [
                        searchCriteria.paddockTypes?.length > 0,
                        searchCriteria.spaces > 0,
                        searchCriteria.maxPrice > 0,
                        searchCriteria.hasArena,
                        searchCriteria.hasRoundYard,
                        searchCriteria.facilities?.length > 0,
                        searchCriteria.careTypes?.length > 0
                      ].filter(Boolean).length;

                      return (
                        <div 
                          key={search.id}
                          className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                            index !== savedSearches.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
                          }`}
                          onClick={() => onNavigate(encodeSearchHash(search.searchCriteria))}
                        >
                          <div className="flex items-center">
                            <div className="flex-grow">
                              <div>
                                <h3 className="font-medium">{search.name}</h3>
                                <p className="text-sm text-neutral-600">{locationDisplay}</p>
                                <p className="text-sm text-neutral-500">{filterCount} filter{filterCount !== 1 ? 's' : ''}</p>
                                {search.enableNotifications && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-2">
                                    <Bell className="w-3 h-3" />
                                    Notify Me
                                  </span>
                                )}
                              </div>
                            </div>
                            <Menu as="div" className="relative">
                              {({ open }) => {
                                const buttonRef = useRef<HTMLButtonElement>(null);
                                const [showAbove, setShowAbove] = useState(false);

                                useEffect(() => {
                                  if (open && buttonRef.current) {
                                    const buttonRect = buttonRef.current.getBoundingClientRect();
                                    const windowHeight = window.innerHeight;
                                    const spaceBelow = windowHeight - buttonRect.bottom;
                                    setShowAbove(spaceBelow < 200); // Menu height + buffer
                                  }
                                }, [open]);

                                return (
                                  <div>
                                    <Menu.Button 
                                      ref={buttonRef}
                                      className="p-3 -m-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-5 h-5 text-neutral-400" />
                                    </Menu.Button>
                                    <Transition
                                      show={open}
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items 
                                        className={`absolute ${showAbove ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]`}
                                      >
                                        <MenuItem>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                              } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 select-none`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(search);
                                              }}
                                            >
                                              Edit
                                            </button>
                                          )}
                                        </MenuItem>
                                        <MenuItem>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                              } group flex items-center w-full px-4 py-2 text-sm text-red-600 select-none`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(search.id, e);
                                              }}
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </MenuItem>
                                      </Menu.Items>
                                    </Transition>
                                  </div>
                                );
                              }}
                            </Menu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </DisclosurePanel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
