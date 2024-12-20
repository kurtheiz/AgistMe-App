import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { SearchRequest } from '../../types/search';
import { SearchCriteriaDisplay } from '../shared/SearchCriteriaDisplay';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchCriteria?: SearchRequest | null;
  existingId?: string;
  initialName?: string;
  initialNotifications?: boolean;
  title?: string;
  onSave: (name: string, enableNotifications: boolean) => Promise<void>;
}

export function SaveSearchModal({ 
  isOpen, 
  onClose, 
  searchCriteria,
  initialName = '',
  initialNotifications = false,
  title = 'Save Search',
  onSave
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

  const handleSave = async () => {
    if (!name.trim() || !isDirty || !searchCriteria) return;
    
    setIsUpdating(true);
    try {
      await onSave(name, enableNotifications);
    } catch (error) {
      console.error('Failed to save search:', error);
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      isUpdating={isUpdating}
      onAction={handleSave}
      disableAction={!name.trim() || !isDirty || !searchCriteria}
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


      </div>
    </Modal>
  );
}
