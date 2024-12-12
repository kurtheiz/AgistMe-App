import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from '../shared/Modal';
import { SearchRequest } from '../../types/search';
import { SearchCriteriaDisplay } from '../shared/SearchCriteriaDisplay';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchCriteria?: SearchRequest | null;
  onSave: (name: string, enableNotifications: boolean) => void;
  initialName?: string;
  initialNotifications?: boolean;
  title?: string;
}

export function SaveSearchModal({ 
  isOpen, 
  onClose, 
  searchCriteria, 
  onSave,
  initialName = '',
  initialNotifications = false,
  title = 'Save Search'
}: SaveSearchModalProps) {
  const [name, setName] = useState(initialName);
  const [enableNotifications, setEnableNotifications] = useState(initialNotifications);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setEnableNotifications(initialNotifications);
      setIsDirty(false);
    }
  }, [isOpen, initialName, initialNotifications]);

  // Track form changes
  useEffect(() => {
    const isNameDirty = name !== initialName;
    const isNotificationsDirty = enableNotifications !== initialNotifications;
    setIsDirty(isNameDirty || isNotificationsDirty);
  }, [name, enableNotifications, initialName, initialNotifications]);

  const handleSave = () => {
    if (!name.trim() || !isDirty) return;
    
    setIsUpdating(true);
    try {
      onSave(name, enableNotifications);
      onClose();
    } catch (error) {
      console.error('Failed to save search:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      isUpdating={isUpdating}
      actionIconType="SAVE"
      onAction={handleSave}
      disableAction={!name.trim() || !isDirty}
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
            Search Name
          </label>
          <input
            type="text"
            id="searchName"
            className="form-input"
            placeholder="Enter a name for your search"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {searchCriteria && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Criteria</h3>
            <SearchCriteriaDisplay searchCriteria={searchCriteria} />
          </div>
        )}

        <div className="flex items-center">
          <Switch
            checked={enableNotifications}
            onChange={setEnableNotifications}
            className={`${
              enableNotifications ? 'bg-primary-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Enable notifications</span>
            <span
              className={`${
                enableNotifications ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <label className="ml-3 text-sm text-gray-700">
            Notify me when new agistments match these criteria
          </label>
        </div>
      </div>
    </Modal>
  );
}
