import { useRef, useState, useEffect, useMemo } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Agistment } from '../../types/agistment';
import { Pencil, Loader2 } from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Modal } from '../shared/Modal';

interface AgistmentPhotosProps {
  agistment: Agistment;
  onPhotosChange: (photos: { link: string; comment?: string }[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
  isEditable?: boolean;
}

interface SortablePhotoProps {
  photo: { link: string; comment?: string };
  index: number;
  disabled?: boolean;
  onRemove: (index: number) => void;
  onCommentEdit: (index: number) => void;
}

const SortablePhoto = ({ photo, index, disabled, onRemove, onCommentEdit }: SortablePhotoProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.link });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm cursor-move w-[160px]">
        <div className="aspect-square relative">
          <img
            src={photo.link}
            alt={photo.comment || `Property photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {index === 0 && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded shadow-sm">
                Main Photo
              </span>
            </div>
          )}
          {!disabled && (
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 rounded-md bg-white/90 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-300 hover:border-red-300 transition-colors duration-200 backdrop-blur-sm"
                title="Remove photo"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <div className="p-2 text-sm text-neutral-600 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {photo.comment || <span className="text-neutral-400 dark:text-neutral-500 italic">Comment...</span>}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onCommentEdit(index)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              title="Add/Edit comment"
            >
              <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgistmentPhotos = ({
  agistment,
  onPhotosChange,
  disabled = false,
  maxPhotos = 3,
  isEditable: _isEditable = true
}: AgistmentPhotosProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalComment, setOriginalComment] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    if (isCommentModalOpen && selectedPhotoIndex !== null) {
      const comment = agistment.photoGallery.photos[selectedPhotoIndex].comment || '';
      setCurrentComment(comment);
      setOriginalComment(comment);
    }
  }, [isCommentModalOpen, selectedPhotoIndex, agistment.photoGallery.photos]);

  const contentHash = useMemo(() => {
    return JSON.stringify({
      current: currentComment,
      original: originalComment
    });
  }, [currentComment, originalComment]);

  const handlePhotosUpdate = (newPhotos: { link: string; comment?: string }[]) => {
    onPhotosChange(newPhotos);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = agistment.photoGallery.photos.findIndex((photo) => photo.link === active.id);
    const newIndex = agistment.photoGallery.photos.findIndex((photo) => photo.link === over.id);

    const newPhotos = arrayMove(agistment.photoGallery.photos, oldIndex, newIndex);
    handlePhotosUpdate(newPhotos);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (agistment.photoGallery?.photos?.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const s3Url = await agistmentService.uploadAgistmentPhoto(file, agistment.id);
      const newPhotos = [...(agistment.photoGallery?.photos || []), { link: s3Url }];
      handlePhotosUpdate(newPhotos);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoRemove = (index: number) => {
    const newPhotos = agistment.photoGallery.photos.filter((_, i) => i !== index);
    handlePhotosUpdate(newPhotos);
  };

  const openCommentModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsCommentModalOpen(true);
  };

  const handleUpdateComment = async () => {
    if (selectedPhotoIndex === null || !isDirty) return;
    
    setIsUpdating(true);
    try {
      const newPhotos = [...agistment.photoGallery.photos];
      newPhotos[selectedPhotoIndex] = {
        ...newPhotos[selectedPhotoIndex],
        comment: currentComment
      };
      
      // Update the backend using the agistment service
      await agistmentService.updateAgistment(agistment.id, {
        photoGallery: {
          photos: newPhotos
        }
      });
      
      // Update the local state
      handlePhotosUpdate(newPhotos);
      setIsCommentModalOpen(false);
      toast.success('Photo comment updated');
    } catch (error) {
      console.error('Error updating photo comment:', error);
      toast.error('Failed to update photo comment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate number of placeholders needed
  const currentPhotos = agistment.photoGallery?.photos?.length || 0;
  const placeholdersNeeded = Math.max(0, maxPhotos - currentPhotos);

  return (
    <div className="space-y-4">
      <div className="max-h-[400px] overflow-y-auto">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={agistment.photoGallery?.photos?.map(p => p.link) || []} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2">
              {agistment.photoGallery?.photos?.map((photo, index) => (
                <SortablePhoto
                  key={photo.link}
                  photo={photo}
                  index={index}
                  disabled={disabled}
                  onRemove={handlePhotoRemove}
                  onCommentEdit={openCommentModal}
                />
              ))}

              {/* Placeholder Upload Buttons */}
              {!disabled && Array.from({ length: placeholdersNeeded }).map((_, index) => (
                <div key={`placeholder-${index}`} className="w-[160px] aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                  <button
                    type="button"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary-600 dark:text-primary-400"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-full text-center text-neutral-600 dark:text-neutral-400"
                      >
                        <PhotoIcon className="w-12 h-12 mb-2" />
                        <span className="text-base font-medium">Add Photo</span>
                        <span className="text-xs">Click to Upload</span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handlePhotoUpload(file);
          }
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Comment Edit Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        size="sm"
        title="Edit Photo Comment"
        contentHash={contentHash}
        onDirtyChange={setIsDirty}
        isUpdating={isUpdating}
        footerContent={({ isUpdating }) => (
          <div className="flex w-full gap-2">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="w-1/3 px-4 py-2.5 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateComment}
              className={`w-2/3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                !isDirty || isUpdating
                  ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                  : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Comment
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={currentComment}
                onChange={(e) => {
                  setCurrentComment(e.target.value);
                  setIsDirty(true);
                }}
                className="form-input"
                placeholder="Add a comment about this photo..."
              />
              <button
                type="button"
                className="input-delete-button"
                onClick={() => {
                  setCurrentComment('');
                  setIsDirty(true);
                }}
                aria-label="Clear comment"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
