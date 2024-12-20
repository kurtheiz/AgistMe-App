import { useState, useEffect, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { AgistmentResponse } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import toast from 'react-hot-toast';

const calculateHash = (obj: unknown): string => {
  return JSON.stringify(obj);
};

interface AgistmentServicesModalProps {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
  disableOutsideClick?: boolean;
}

export const AgistmentServicesModal: React.FC<AgistmentServicesModalProps> = ({
  agistment,
  isOpen,
  onClose,
  onUpdate,
  disableOutsideClick
}) => {
  const [editableServices, setEditableServices] = useState<string[]>(agistment.propertyServices?.services || []);
  const [newService, setNewService] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setEditableServices(agistment.propertyServices?.services || []);
      setInitialHash(calculateHash(agistment.propertyServices?.services || []));
      setIsDirty(false);
      setNewService('');
    }
  }, [isOpen, agistment]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editableServices);
    setIsDirty(currentHash !== initialHash);
  }, [editableServices, initialHash]);

  const handleAddService = useCallback(() => {
    if (newService.trim()) {
      setEditableServices(prev => [...prev, newService.trim()]);
      setNewService('');
      setIsDirty(true);
    }
  }, [newService]);

  const handleRemoveService = useCallback((index: number) => {
    setEditableServices(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      const updatedAgistment: AgistmentResponse = {
        ...agistment,
        propertyServices: {
          ...agistment.propertyServices,
          services: editableServices
        }
      };
      await onUpdate(updatedAgistment);
      onClose();
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to save services');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Services"
      size="md"
      onAction={handleSave}
      isUpdating={isSaving}
      disableAction={!isDirty}
      disableOutsideClick={disableOutsideClick}
    >
      <div className="space-y-4">
        <div className="form-group">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              className="form-input form-input-compact"
              placeholder="Enter service name"
            />
            <button
              type="button"
              onClick={handleAddService}
              disabled={!newService.trim()}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {editableServices.map((service, index) => (
              <div
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
              >
                {service}
                <button
                  onClick={() => handleRemoveService(index)}
                  className="ml-2 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {editableServices.length === 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No services added yet</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
