import { useState, useEffect, useRef } from 'react';
import { Modal } from '../shared/Modal';
import { AgistmentResponse } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Loader2 } from 'lucide-react';

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
  const [isComplete, setIsComplete] = useState(false);
  const [updateDescription, setUpdateDescription] = useState<string | undefined>();
  const [lastProcessedDescription, setLastProcessedDescription] = useState('');
  const [processingStatus, setProcessingStatus] = useState(0);
  const changesRef = useRef<HTMLDivElement>(null);

  const processingStates = [
    'Analyzing text...',
    'Extracting details...',
    'Processing content...',
    'Finalizing updates...',
  ];

  useEffect(() => {
    let statusInterval: NodeJS.Timeout;
    if (isProcessing) {
      statusInterval = setInterval(() => {
        setProcessingStatus(prev => (prev + 1) % processingStates.length);
      }, 2000);
    } else {
      setProcessingStatus(0);
    }
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [isProcessing]);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setIsComplete(false);
      setUpdateDescription(undefined);
      setLastProcessedDescription('');
      setProcessingStatus(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isComplete && changesRef.current) {
      changesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isComplete]);

  const renderHighlightedText = () => {
    if (!isProcessing) return description;
    
    return (
      <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <span className="text-neutral-600 text-sm font-medium">
              {processingStates[processingStatus]}
            </span>
          </div>
          
          <div className="w-full max-w-xs">
            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ 
                  width: `${((processingStatus + 1) / processingStates.length) * 100}%`,
                  transition: 'width 2s ease-in-out'
                }}
              />
            </div>
          </div>

          <p className="text-sm text-neutral-500">
            Please wait while we process your content...
          </p>
        </div>
      </div>
    );
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
      setUpdateDescription(updatedAgistment.lastUpdateDescription);
      setIsComplete(true);
      setLastProcessedDescription(description);
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
      disableAction={isProcessing || !description.trim() || description === lastProcessedDescription}
      cancelLabel="Close"
      disableCancel={isProcessing}
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
