import { useState, useEffect, useRef } from 'react';
import { Modal } from '../shared/Modal';
import { AgistmentResponse } from '../../types/agistment';
import toast from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Loader2, Brain, Sparkles, Code2 } from 'lucide-react';

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
  const [lastProcessedDescription, setLastProcessedDescription] = useState('');
  const [processingStatus, setProcessingStatus] = useState(0);
  const changesRef = useRef<HTMLDivElement>(null);

  const processingStates = [
    'Analyzing text structure...',
    'Extracting key information...',
    'Processing property details...',
    'Identifying amenities...',
    'Validating data format...',
    'Generating listing updates...',
    'Optimizing content...',
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isProcessing && description) {
      const sentences = description.split(/[.!?]+/).filter(Boolean);
      intervalId = setInterval(() => {
        setHighlightedWordIndex(prev => (prev + 1) % sentences.length);
      }, 1000);
    } else {
      setHighlightedWordIndex(-1);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing, description]);

  const renderHighlightedText = () => {
    if (!isProcessing) return description;
    const sentences = description.split(/[.!?]+/).filter(Boolean);
    
    return (
      <div className="font-mono bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-400 animate-pulse" />
              <span className="text-primary-400 text-sm font-semibold">AI Analysis in Progress</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {sentences.map((sentence, index) => (
              <div
                key={index}
                className={`transition-all duration-500 p-3 rounded-lg ${
                  index === highlightedWordIndex
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : index < highlightedWordIndex
                    ? 'bg-slate-800/50 text-slate-400'
                    : 'bg-slate-800/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    {index < highlightedWordIndex ? (
                      <Sparkles className="w-4 h-4 text-primary-400" />
                    ) : index === highlightedWordIndex ? (
                      <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    ) : (
                      <span className="text-xs text-slate-500">{index + 1}</span>
                    )}
                  </div>
                  <span className={index === highlightedWordIndex ? 'text-primary-100' : ''}>
                    {sentence.trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span className="animate-fade-in-out">{processingStates[processingStatus]}</span>
            </div>
          </div>
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
