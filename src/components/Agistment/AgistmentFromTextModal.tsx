import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { AgistmentResponse } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
  disableOutsideClick?: boolean;
}

export function AgistmentFromTextModal({
  agistment,
  isOpen,
  onClose,
  onUpdate,
  disableOutsideClick
}: Props) {
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isProcessing && description) {
      const words = description.split(/\s+/);
      intervalId = setInterval(() => {
        setHighlightedWordIndex(prev => (prev + 1) % words.length);
      }, 100);
    } else {
      setHighlightedWordIndex(-1);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing, description]);

  const renderHighlightedText = () => {
    if (!isProcessing) return description;
    const words = description.split(/\s+/);
    return words.map((word, index) => (
      <span key={index} className={index === highlightedWordIndex ? 'bg-yellow-200 transition-colors duration-100' : ''}>
        {word}{' '}
      </span>
    ));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsProcessing(true);
    try {
      const updatedAgistment = await agistmentService.updateFromText(agistment.id, description);
      if (onUpdate) {
        onUpdate(updatedAgistment);
      }
      toast.success('Listing updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disableOutsideClick={disableOutsideClick}
      title="Update Listing from Text"
      onAction={handleSubmit}
      actionLabel={isProcessing ? 'Processing...' : 'Update Listing'}
      disableAction={isProcessing || !description.trim()}
      cancelLabel="Cancel"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Description
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Enter your property description or updates in plain text. This could be from social media, your website, or any other source.
            Our AI will analyze your input and generate, or update, your listing based on the information provided.
          </p>
          <textarea
            className="form-textarea min-h-[350px]"
            placeholder="Paste, or type, your property description updates here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="form-textarea min-h-[350px] absolute inset-0 bg-white p-3 overflow-y-auto">
              {renderHighlightedText()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
