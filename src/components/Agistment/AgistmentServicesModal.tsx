import { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Plus } from 'lucide-react';
import { Agistment } from '../../types/agistment';
import { Modal } from '../shared/Modal';
import { classNames } from '../../utils/classNames';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const calculateHash = (obj: any): string => {
  return JSON.stringify(obj);
};

interface AgistmentServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: string[];
  agistmentId: string;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentServicesModal: React.FC<AgistmentServicesModalProps> = ({
  isOpen,
  onClose,
  services = [],
  onUpdate
}) => {
  const [editableServices, setEditableServices] = useState<string[]>(services);
  const [newService, setNewService] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');

  // Set initial hash when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setInitialHash(calculateHash(services));
      setIsDirty(false);
    }
  }, [isOpen, services]);

  // Update dirty state whenever form changes
  useEffect(() => {
    const currentHash = calculateHash(editableServices);
    setIsDirty(currentHash !== initialHash);
  }, [editableServices, initialHash]);

  // Reset form when modal opens or services change
  useEffect(() => {
    if (isOpen || services) {
      setEditableServices(services);
      setNewService('');
    }
  }, [isOpen, services]);

  const handleAddService = () => {
    if (newService.trim()) {
      setEditableServices(prev => [...prev, newService.trim()]);
      setNewService('');
      setIsDirty(true);
    }
  };

  const handleRemoveService = (index: number) => {
    setEditableServices(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleUpdateAll = async () => {
    if (!isDirty || !onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate({
        propertyServices: {
          services: editableServices
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to update services:', error);
      toast.error('Failed to update services');
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
      isUpdating={isSaving}
      actionIcon={<Save className="h-5 w-5" />}
      onAction={handleUpdateAll}
      isDirty={isDirty}
    >
      <div className="space-y-4">
        <div className="form-group">
          <div className="input-wrapper group">
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
              className={classNames(
                'absolute right-2 px-2 py-1 rounded-md',
                newService.trim()
                  ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  : 'text-neutral-400 cursor-not-allowed'
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {editableServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 group"
              >
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                  {service}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="input-delete-button"
                >
                  <X className="h-4 w-4" />
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
