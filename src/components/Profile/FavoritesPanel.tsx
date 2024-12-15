import { Heart, ChevronDown, Trash2 } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Favourite } from '../../types/profile';
import { useFavoritesStore } from '../../stores/favorites.store';

interface FavoritesPanelProps {
  onNavigate: (id: string) => void;
  onDelete: (favoriteId: string, e: React.MouseEvent) => void;
}

export function FavoritesPanel({
  onNavigate,
  onDelete
}: FavoritesPanelProps) {
  const { favorites, isLoading } = useFavoritesStore();

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
                ) : !favorites || favorites.length === 0 ? (
                  <div className="text-neutral-600">No favourites yet</div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((favourite, index) => {
                      const isInactive = favourite.status === 'HIDDEN' || favourite.status === 'REMOVED';
                      return (
                        <div 
                          key={favourite.id} 
                          className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                            index !== favorites.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
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
                            <button
                              className="p-3 -m-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(favourite.id, e);
                              }}
                              aria-label="Delete favorite"
                            >
                              <Trash2 className="w-5 h-5 text-neutral-400 hover:text-red-500" />
                            </button>
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
