import { SearchModal } from './SearchModal';
import { SearchCriteria } from '../../types/search';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Search({ isOpen, onClose }: SearchProps) {
  const handleSearch = (criteria: SearchCriteria) => {
    // TODO: Implement search functionality
    console.log('Search criteria:', criteria);
  };

  return (
    <SearchModal
      isOpen={isOpen}
      onClose={onClose}
      onSearch={handleSearch}
    />
  );
}

// Export a function to open the modal that can be used from other components
export function openSearchModal(setIsModalOpen: (open: boolean) => void) {
  setIsModalOpen(true);
}
