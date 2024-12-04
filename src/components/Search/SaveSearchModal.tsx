import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { SearchCriteria } from '../../types/search';
import { useProfile } from '../../context/ProfileContext';
import { profileService } from '../../services/profile.service';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchCriteria: SearchCriteria | null;
}

export function SaveSearchModal({ isOpen, onClose, searchCriteria }: SaveSearchModalProps) {
  const [name, setName] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { profile, refreshProfile } = useProfile();

  const handleSave = async () => {
    if (!name.trim() || !searchCriteria || !profile) return;
    
    setIsUpdating(true);
    try {
      // Create the search hash from the criteria
      const searchData = {
        s: searchCriteria.suburbs.map(s => ({
          i: s.id,
          n: s.suburb,
          p: s.postcode,
          t: s.state,
          r: s.region,
          g: s.geohash,
          l: s.locationType
        })),
        r: searchCriteria.radius,
        pt: searchCriteria.paddockTypes,
        sp: searchCriteria.spaces,
        mp: searchCriteria.maxPrice,
        a: searchCriteria.hasArena,
        ry: searchCriteria.hasRoundYard,
        f: searchCriteria.facilities,
        ct: searchCriteria.careTypes
      };

      const savedSearch = {
        id: crypto.randomUUID(),
        name: name.trim(),
        searchHash: btoa(JSON.stringify(searchData)),
        lastUpdate: new Date().toISOString(),
        enableNotifications
      };

      // Create updated profile with new saved search
      const updatedProfile = {
        ...profile,
        savedSearches: [...(profile.savedSearches || []), savedSearch]
      };

      // Send complete profile update
      await profileService.updateProfile(updatedProfile);
      
      // Refresh profile to get updated data
      await refreshProfile();
      onClose();
    } catch (error) {
      console.error('Error saving search:', error);
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
      if (searchCriteria.radius > 0) {
        parts.push(`within ${searchCriteria.radius}km`);
      }
    }
    
    if (searchCriteria.spaces > 0) {
      parts.push(`Spaces: ${searchCriteria.spaces}`);
    }
    
    if (searchCriteria.maxPrice > 0) {
      parts.push(`Max Price: $${searchCriteria.maxPrice}/week`);
    }
    
    if (searchCriteria.paddockTypes?.length > 0) {
      parts.push(`Paddock Types: ${searchCriteria.paddockTypes.join(', ')}`);
    }
    
    if (searchCriteria.hasArena) parts.push('Arena');
    if (searchCriteria.hasRoundYard) parts.push('Round Yard');
    
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
      title="Save Search"
      size="md"
      isUpdating={isUpdating}
      actionIconType="SAVE"
      onAction={handleSave}
      disableAction={!name.trim() || !searchCriteria}
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
          <input
            id="notifications"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={enableNotifications}
            onChange={(e) => setEnableNotifications(e.target.checked)}
          />
          <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
            Notify me when new agistments match these criteria
          </label>
        </div>
      </div>
    </Modal>
  );
}
