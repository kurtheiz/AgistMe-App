import { Modal } from '../shared/Modal';
import { useState, useEffect } from 'react';
import { Image, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { AgistmentResponse } from '../../types/agistment';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
  disableOutsideClick?: boolean;
}

interface SortablePhotoProps {
  photo: { link: string; comment?: string }
  index: number
  disabled?: boolean
  onRemove: (index: number) => void
}

const SortablePhoto = ({ photo, index, disabled, onRemove }: SortablePhotoProps) => {
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
      <div className="w-[160px] space-y-2">
        <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm cursor-move">
          <div className="aspect-square relative">
            <img
              src={photo.link}
              alt={`Property photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded shadow-sm">
                  Main Photo
                </span>
              </div>
            )}
          </div>
        </div>
        {!disabled && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="p-2 rounded-md bg-white dark:bg-neutral-700 hover:bg-red-50 dark:hover:bg-red-900 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-600 hover:border-red-300 dark:hover:border-red-700 transition-colors duration-200 touch-manipulation"
              title="Remove photo"
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export function AgistmentPhotosModal({
  agistment,
  isOpen,
  onClose,
  onUpdate,
  disableOutsideClick
}: Props) {
  const [localAgistment, setLocalAgistment] = useState<AgistmentResponse>(agistment);
  const [isUploading, setIsUploading] = useState(false);
  const maxPhotos = 5;

  useEffect(() => {
    setLocalAgistment(agistment);
  }, [agistment]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handlePhotosChange = (photos: { link: string; comment: string }[]) => {
    const newState = {
      ...localAgistment,
      photoGallery: {
        ...localAgistment.photoGallery,
        photos
      }
    };
    onUpdate?.(newState);
    setLocalAgistment(newState);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localAgistment.photoGallery.photos.findIndex((photo) => photo.link === active.id);
    const newIndex = localAgistment.photoGallery.photos.findIndex((photo) => photo.link === over.id);

    const newPhotos = arrayMove(localAgistment.photoGallery.photos, oldIndex, newIndex).map(photo => ({
      link: photo.link,
      comment: photo.comment || ''
    }));
    handlePhotosChange(newPhotos);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (localAgistment.photoGallery?.photos?.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const s3Url = await agistmentService.uploadAgistmentPhoto(file, localAgistment.id);
      const newPhotos = [...(localAgistment.photoGallery?.photos || []).map(p => ({
        link: p.link,
        comment: p.comment || ''
      })), { link: s3Url, comment: '' }];
      handlePhotosChange(newPhotos);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoRemove = async (index: number) => {
    // Don't allow removing the last photo if the agistment is published
    if (localAgistment.status === 'PUBLISHED' && localAgistment.photoGallery.photos.length <= 1) {
      toast.error('At least one photo is required for published listings');
      return;
    }

    const newPhotos = localAgistment.photoGallery.photos
      .filter((_, i) => i !== index)
      .map(photo => ({
        link: photo.link,
        comment: photo.comment || ''
      }));
    
    const newState = {
      ...localAgistment,
      photoGallery: {
        ...localAgistment.photoGallery,
        photos: newPhotos
      }
    };
    
    // First update the parent
    onUpdate?.(newState);
    
    // Then update local state
    setLocalAgistment(newState);
  };

  // Calculate number of placeholders needed
  const currentPhotos = localAgistment.photoGallery?.photos?.length || 0;
  const placeholdersNeeded = Math.max(0, maxPhotos - currentPhotos);

  if (!localAgistment?.photoGallery?.photos) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Property Photos"
      size="4xl"
      cancelLabel="Close"
      disableOutsideClick={disableOutsideClick}
    >
      <div className="p-2">
        <div className="space-y-2">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            <div className="mb-1">
              <p className="font-medium">Photo Requirements:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5">
                <li>Recommended size: 1800 x 1200 pixels (3:2 ratio)</li>
                <li>Minimum size: 1200 x 800 pixels</li>
                <li>Maximum file size: 5MB</li>
                <li>Format: JPEG</li>
              </ul>
            </div>
          </div>
          <div className="text-sm text-neutral-500 flex items-center gap-2">
            <span>Tip: Drag and drop photos to rearrange their order</span>
          </div>
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={localAgistment.photoGallery?.photos?.map(p => p.link) || []} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-[840px] mx-auto">
                  {localAgistment.photoGallery?.photos?.map((photo, index) => (
                    <SortablePhoto
                      key={photo.link}
                      photo={photo}
                      index={index}
                      onRemove={handlePhotoRemove}
                    />
                  ))}
                  {/* Placeholder Upload Buttons */}
                  {Array.from({ length: placeholdersNeeded }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="w-[160px] aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                      <button
                        type="button"
                        onClick={() => {
                          // Create a new file input element
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handlePhotoUpload(file);
                          };
                          // Trigger the file dialog
                          input.click();
                        }}
                        className="flex flex-col items-center justify-center w-full h-full p-4 space-y-2"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600" />
                        ) : (
                          <>
                            <Image className="w-6 h-6 text-neutral-400" />
                            <span className="text-xs text-neutral-500">Upload Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AgistmentPhotosModal;
