import { Heart, ChevronDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, Transition } from '@headlessui/react';
import { useRef, useState, useEffect } from 'react';
import { Favourite } from '../../types/profile';

interface FavoritesPanelProps {
  favourites: Favourite[];
  isLoading: boolean;
  onNavigate: (id: string) => void;
  onDelete: (favoriteId: string, e: React.MouseEvent) => void;
}

export function FavoritesPanel({
  favourites,
  isLoading,
  onNavigate,
  onDelete
}: FavoritesPanelProps) {
  return (
    <div id="favourites-section">
      <Disclosure>
        {({ open }) => (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <DisclosureButton className={`w-full px-4 py-4 text-left flex justify-between items-center ${open ? 'rounded-t-lg' : 'rounded-lg'}`}>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-neutral-500" />
                <span className="text-lg font-medium">My Favourites</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''} text-neutral-500`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-6 pb-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-neutral-600">Loading favourites...</div>
                ) : !favourites || favourites.length === 0 ? (
                  <div className="text-neutral-600">No favourites yet</div>
                ) : (
                  <div className="space-y-4">
                    {favourites.map((favourite, index) => {
                      const isInactive = favourite.status === 'HIDDEN' || favourite.status === 'REMOVED';
                      return (
                        <div 
                          key={favourite.id} 
                          className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                            index !== favourites.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
                          }`}
                          onClick={() => !isInactive && onNavigate(favourite.id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-grow">
                              <div>
                                <h3 className="font-medium">{favourite.name}</h3>
                                <p className="text-sm text-neutral-600">{favourite.location.suburb}, {favourite.location.state}</p>
                                {(favourite.status === 'HIDDEN' || favourite.status === 'REMOVED') && (
                                  <span className="chip-unavailable mt-2">
                                    {favourite.status === 'HIDDEN' ? 'Hidden' : 'Removed'}
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
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                              } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(favourite.id, e);
                                              }}
                                            >
                                              <Trash2 className="w-4 h-4 mr-3" />
                                              Delete
                                            </button>
                                          )}
                                        </Menu.Item>
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
