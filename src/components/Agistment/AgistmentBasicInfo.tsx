import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Agistment } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';
import NumberStepper from '../shared/NumberStepper';

interface Props {
  agistmentId: string;
  basicInfo: Agistment['basicInfo'];
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentBasicInfo = ({ agistmentId, basicInfo, isEditable = false, onUpdate }: Props) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: basicInfo.name,
    propertySize: basicInfo.propertySize
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [propertySizeError, setPropertySizeError] = useState('');

  useEffect(() => {
    if (isEditDialogOpen) {
      setEditForm({
        name: basicInfo.name,
        propertySize: basicInfo.propertySize
      });
      setIsDirty(false);
    }
  }, [isEditDialogOpen, basicInfo]);

  const handleUpdateBasicInfo = async () => {
    if (!agistmentId || !isDirty) return;

    if (editForm.name.trim().length < 3) {
      setNameError('Name must be at least 3 characters long');
      return;
    }

    if (editForm.propertySize < 0) {
      setPropertySizeError('Property size cannot be negative');
      return;
    }

    setIsUpdating(true);
    try {
      await agistmentService.updateBasicInfo(agistmentId, {
        name: editForm.name,
        propertySize: editForm.propertySize
      });
      setIsEditDialogOpen(false);
      toast.success('Basic info updated successfully');
      
      if (onUpdate) {
        onUpdate({
          basicInfo: editForm
        });
      }
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast.error('Failed to update basic info');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <div className="section-title-wrapper">
            <div className="flex flex-col">
              <h2 className="text-title">
                {basicInfo.name}
              </h2>
              <span className="text-sm text-neutral-600">
                {basicInfo.propertySize > 0 ? `Situated on ${basicInfo.propertySize} acres` : ''}
              </span>
            </div>
            {isEditable && (
              <button
                onClick={() => {
                  setEditForm({
                    name: basicInfo.name,
                    propertySize: basicInfo.propertySize
                  });
                  setIsEditDialogOpen(true);
                }}
                className="btn-edit"
              >
                <Pencil className="w-5 h-5 text-neutral-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditable && (
        <Modal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Basic Info"
          size="sm"
          onDirtyChange={setIsDirty}
          isUpdating={isUpdating}
          footerContent={({ isUpdating }) => (
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleUpdateBasicInfo}
                className={`w-full px-4 py-4 sm:py-2.5 text-base sm:text-sm font-medium rounded-md transition-colors ${
                  !isDirty || isUpdating
                    ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 opacity-50 cursor-not-allowed'
                    : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
                disabled={!isDirty || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Property Name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim().length >= 3) {
                      setNameError('');
                    }
                    setIsDirty(true);
                  }}
                  className="form-input"
                />
                <button
                  type="button"
                  className="input-delete-button"
                  onClick={() => setEditForm(prev => ({ ...prev, name: '' }))}
                  aria-label="Clear property name"
                >
                  ✕
                </button>
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>
            <div>
              <NumberStepper
                label="Property Size"
                value={editForm.propertySize}
                onChange={(value) => {
                  setEditForm(prev => ({ ...prev, propertySize: value }));
                  if (value >= 0) {
                    setPropertySizeError('');
                  }
                  setIsDirty(true);
                }}
                min={0}
                step={1}
                formatValue={(value) => `${value} acres`}
              />
              {propertySizeError && (
                <p className="mt-1 text-sm text-red-600">{propertySizeError}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
