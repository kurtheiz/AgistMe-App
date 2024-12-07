import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from '../shared/Modal';
import { SearchRequest } from '../../types/search';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchCriteria: SearchRequest | null;
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
    if (!name.trim() || !searchCriteria || !isDirty) return;
    
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

  // Helper function to format facility name
  const formatFacilityName = (facility: string): string => {
    switch (facility) {
      case 'feedRoom': return 'Feed Room';
      case 'tackRoom': return 'Tack Room';
      case 'floatParking': return 'Float Parking';
      case 'hotWash': return 'Hot Wash';
      case 'stable': return 'Stable';
      case 'tieUp': return 'Tie Up';
      default: return facility;
    }
  };

  // Helper function to format criteria for display
  const formatCriteria = () => {
    if (!searchCriteria) return [];
    
    const parts = [];
    
    if (searchCriteria.suburbs?.length > 0) {
      parts.push(`Location: ${searchCriteria.suburbs.map(s => s.suburb).join(', ')}`);
      if (searchCriteria.radius) {
        parts.push(`within ${searchCriteria.radius}km`);
      }
    }

    if (searchCriteria.paddockTypes?.length > 0) {
      parts.push(`Paddock Types: ${searchCriteria.paddockTypes.join(', ')}`);
    }

    if (searchCriteria.spaces > 0) {
      parts.push(`Spaces: ${searchCriteria.spaces}`);
    }

    if (searchCriteria.maxPrice > 0) {
      parts.push(`Max Price: $${searchCriteria.maxPrice}`);
    }

    if (searchCriteria.hasArena) {
      parts.push('Has Arena');
    }

    if (searchCriteria.hasRoundYard) {
      parts.push('Has Round Yard');
    }

    if (searchCriteria.facilities?.length > 0) {
      parts.push(`Facilities: ${searchCriteria.facilities.map(formatFacilityName).join(', ')}`);
    }

    if (searchCriteria.careTypes?.length > 0) {
      parts.push(`Care Types: ${searchCriteria.careTypes.map(type => `${type} Care`).join(', ')}`);
    }

    return parts;
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
      disableAction={!name.trim() || !searchCriteria || !isDirty}
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

        {searchCriteria ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Criteria</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <ul className="space-y-2">
                {formatCriteria().map((criterion, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {criterion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No search criteria available
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
