import { useState, useEffect, useRef } from 'react';
import { Modal } from '../shared/Modal';
import { profileService } from '../../services/profile.service';
import { SavedSearch } from '../../types/profile';
import { Check, X, PencilIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { decodeSearchHash } from '../../utils/searchUtils';
import { Switch } from '@headlessui/react';

interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedSearchesModal({ isOpen, onClose }: SavedSearchesModalProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAbove, setShowAbove] = useState(true);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadSavedSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deletingId && 
          confirmDialogRef.current && 
          !confirmDialogRef.current.contains(event.target as Node) &&
          deleteButtonRef.current &&
          !deleteButtonRef.current.contains(event.target as Node)) {
        setDeletingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [deletingId]);

  const loadSavedSearches = async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getSavedSearches();
      // Sort by lastUpdate, most recent first
      const sortedSearches = response.savedSearches.sort((a, b) => 
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      );
      setSavedSearches(sortedSearches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
      toast.error('Failed to load saved searches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (searchId: string) => {
    try {
      const updatedSearches = savedSearches.filter(search => search.id !== searchId);
      await profileService.updateSavedSearches(updatedSearches);
      setSavedSearches(updatedSearches);
      setDeletingId(null);
      toast.success('Search deleted');
    } catch (error) {
      console.error('Failed to delete search:', error);
      toast.error('Failed to delete search');
    }
  };

  const handleNotificationToggle = async (searchHash: string, checked: boolean) => {
    try {
      const updatedSearches = savedSearches.map(search => {
        if (search.searchHash === searchHash) {
          return {
            ...search,
            enableNotifications: checked
          };
        }
        return search;
      });
      await profileService.updateSavedSearches(updatedSearches);
      setSavedSearches(updatedSearches);
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  const handleRename = async (searchId: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const updatedSearches = savedSearches.map(search => {
        if (search.id === searchId) {
          return {
            ...search,
            name: editingName.trim()
          };
        }
        return search;
      });
      await profileService.updateSavedSearches(updatedSearches);
      setSavedSearches(updatedSearches);
      setEditingId(null);
      toast.success('Search renamed');
    } catch (error) {
      console.error('Failed to rename search:', error);
      toast.error('Failed to rename search');
    }
  };

  const handleDeleteClick = (searchId: string) => {
    const buttonRect = deleteButtonRef.current?.getBoundingClientRect();
    if (buttonRect) {
      // If there's less than 200px above the button, show below instead
      setShowAbove(buttonRect.top > 200);
    }
    setDeletingId(searchId);
  };

  const formatLastUpdate = (date: string) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Less than an hour ago'
        : `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return updateDate.toLocaleDateString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Searches"
      size="sm"
    >
      <div className="p-4 pb-8 max-h-[80vh]">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No saved searches yet
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {savedSearches.map((search) => {
              const decodedSearch = decodeSearchHash(search.searchHash);
              const locationName = decodedSearch.suburbs[0]?.suburb || 'Any location';
              const radius = decodedSearch.radius > 0 ? ` within ${decodedSearch.radius}km` : '';
              
              // Format additional details
              const details = [];
              if (decodedSearch.spaces > 0) details.push(`${decodedSearch.spaces} spaces`);
              if (decodedSearch.maxPrice > 0) details.push(`$${decodedSearch.maxPrice}/week`);
              if (decodedSearch.paddockTypes.length > 0) {
                details.push(...decodedSearch.paddockTypes.map(type => 
                  type.charAt(0).toUpperCase() + type.slice(1)
                ));
              }
              if (decodedSearch.hasArena) details.push('Arena');
              if (decodedSearch.hasRoundYard) details.push('Round Yard');
              if (decodedSearch.facilities?.length > 0) {
                details.push(...decodedSearch.facilities.map(facility => {
                  switch (facility) {
                    case 'feedRoom': return 'Feed Room';
                    case 'tackRoom': return 'Tack Room';
                    case 'floatParking': return 'Float Parking';
                    case 'hotWash': return 'Hot Wash';
                    case 'stables': return 'Stables';
                    case 'tieUp': return 'Tie Up';
                    default: return facility;
                  }
                }));
              }
              if (decodedSearch.careTypes?.length > 0) {
                details.push(...decodedSearch.careTypes.map(care => `${care} Care`));
              }

              return (
                <div 
                  key={search.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors dark:border-neutral-700 dark:hover:border-neutral-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          {editingId === search.id ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleRename(search.id);
                              }}
                              className="space-y-2"
                            >
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                                  title="Save new name"
                                >
                                  <Check className="h-3 w-3" />
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingName('');
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                  title="Cancel rename"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                {search.name}
                              </h3>
                              <button
                                onClick={() => {
                                  setEditingId(search.id);
                                  setEditingName(search.name);
                                }}
                                className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400"
                                title="Rename saved search"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Switch
                              checked={search.enableNotifications}
                              onChange={(checked) => handleNotificationToggle(search.searchHash, checked)}
                              className={`${
                                search.enableNotifications ? 'bg-primary-500 dark:bg-primary-400' : 'bg-neutral-200 dark:bg-neutral-700'
                              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                              <span className="sr-only">Enable notifications</span>
                              <span
                                className={`${
                                  search.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </Switch>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {search.enableNotifications ? 'Notifications enabled' : 'Notifications disabled'}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            ref={deleteButtonRef}
                            onClick={() => setDeletingId(search.id)}
                            className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400 focus:outline-none"
                            title="Delete saved search"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>

                          {/* Delete Confirmation Dialog */}
                          {deletingId === search.id && createPortal(
                            <div 
                              ref={confirmDialogRef}
                              className="fixed z-[100]"
                              style={{
                                top: deleteButtonRef.current?.getBoundingClientRect().top,
                                left: deleteButtonRef.current?.getBoundingClientRect().right,
                                transform: `translate(-100%, ${showAbove ? '-100%' : '0%'})`,
                              }}
                            >
                              <div className="w-64 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                                  Are you sure you want to delete this saved search?
                                </p>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingId(null);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(search.id);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>,
                            document.body
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {locationName}{radius}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-500">
                            {formatLastUpdate(search.lastUpdate)}
                          </span>
                        </div>
                        {details.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {details.map((detail, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 ring-1 ring-inset ring-neutral-500/10 dark:ring-neutral-400/20"
                              >
                                {detail}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
