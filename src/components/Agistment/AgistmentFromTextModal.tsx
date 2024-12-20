import { useState, useEffect, useRef } from 'react';
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
  const [isComplete, setIsComplete] = useState(false);
  const [updateDescription, setUpdateDescription] = useState<string | undefined>();
  const changesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setIsComplete(false);
      setUpdateDescription(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isComplete && changesRef.current) {
      changesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isComplete]);

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
    if (!description.trim() && !isComplete) {
      toast.error('Please enter a description');
      return;
    }

    if (isComplete) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      const updatedAgistment = await agistmentService.updateFromText(agistment.id, description);
      if (onUpdate) {
        onUpdate(updatedAgistment);
      }
      toast.success('Listing updated successfully');
      setUpdateDescription(updatedAgistment.lastUpdateDescription);
      setIsComplete(true);
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
      actionLabel={isComplete ? 'Got it' : isProcessing ? 'Processing...' : 'Update Listing'}
      disableAction={isProcessing || (!description.trim() && !isComplete)}
      cancelLabel={isComplete ? undefined : 'Cancel'}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2 -mt-2 mb-2">
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            Preview Feature
          </span>
          <span className="text-xs text-gray-500">
            This feature is currently in preview
          </span>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Description
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Enter your property description or updates in plain text. This could be from social media, your website, or any other source.
            Our AI will analyze your input and generate, or update, your listing based on the information provided.
          </p>
          <div className="relative h-[350px]">
            <textarea
              className="form-textarea w-full h-full resize-none"
              placeholder="Paste, or type, your property description updates here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-white p-3 overflow-y-auto border rounded-md">
                {renderHighlightedText()}
              </div>
            )}
          </div>
        </div>

        {/* Response Section */}
        <div ref={changesRef} className="flex-1 border-t pt-4 scroll-mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Changes Made
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Here are the changes that were made to your listing:
          </p>
          <div className="h-[175px] bg-gray-50 rounded-md p-3 overflow-y-auto">
            {isComplete ? (
              <div className="prose prose-sm">
                {updateDescription || 'No changes were detected.'}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Changes will appear here after processing
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
