import { useRef, useState } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { Agistment } from '../../types/agistment';
import { Dialog } from '@headlessui/react';
import { EditIcon } from '../../components/Icons';
import { Pencil } from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AgistmentPhotosProps {
  agistment: Agistment;
  onPhotosChange: (photos: { link: string; comment?: string }[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
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
      <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm cursor-move">
        <div className="aspect-square w-full max-w-[200px] relative">
          <img
            src={photo.link}
            alt={photo.comment || `Property photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
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
        <div className="p-3 text-sm text-neutral-600 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex items-start justify-between">
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
              <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          )}
          {true && (
            <button className="btn-edit">
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
  maxPhotos = 3
}: AgistmentPhotosProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState('');

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = agistment.photoGallery.photos.findIndex(photo => photo.link === active.id);
      const newIndex = agistment.photoGallery.photos.findIndex(photo => photo.link === over.id);
      
      const newPhotos = arrayMove(agistment.photoGallery.photos, oldIndex, newIndex);
      updatePhotos(newPhotos);
    }
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
      updatePhotos(newPhotos);
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
    updatePhotos(newPhotos);
  };

  const openCommentModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setCurrentComment(agistment.photoGallery.photos[index].comment || '');
    setIsCommentModalOpen(true);
  };

  const handleCommentSave = () => {
    if (selectedPhotoIndex === null) return;
    
    const newPhotos = [...agistment.photoGallery.photos];
    newPhotos[selectedPhotoIndex] = {
      ...newPhotos[selectedPhotoIndex],
      comment: currentComment
    };
    updatePhotos(newPhotos);
    setIsCommentModalOpen(false);
    toast.success('Photo comment updated');
  };

  const updatePhotos = async (photos: { link: string; comment?: string }[]) => {
    try {
      await agistmentService.updatePhotoGallery(agistment.id, { photos });
      onPhotosChange(photos);
    } catch (error) {
      console.error('Error updating photos:', error);
      toast.error('Failed to update photos');
    }
  };

  // Calculate number of placeholders needed
  const currentPhotos = agistment.photoGallery?.photos?.length || 0;
  const placeholdersNeeded = Math.max(0, maxPhotos - currentPhotos);

  return (
    <div className="space-y-4">
      <div className="max-h-[400px] overflow-y-auto pr-2">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={agistment.photoGallery?.photos?.map(p => p.link) || []} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                <div key={`placeholder-${index}`} className="aspect-square w-full max-w-[200px] bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
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
                        <span className="text-lg font-medium">Add Photo</span>
                        <span className="text-sm">Click to Upload</span>
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

      <Dialog
        open={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-neutral-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              Photo Comment
            </Dialog.Title>
            <div className="space-y-4">
              <textarea
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                className="w-full h-32 px-3 py-2 text-base text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900"
                placeholder="Add a comment to describe this photo..."
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCommentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommentSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
