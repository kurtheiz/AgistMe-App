import { useState } from 'react';
import { Image, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { agistmentService } from '../../services/agistment.service';
import { AgistmentResponse } from '../../types/agistment';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AgistmentPhotosProps {
  agistment: AgistmentResponse;
  onPhotosChange: (photos: { link: string }[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
  isEditable?: boolean;
}

interface SortablePhotoProps {
  photo: { link: string };
  index: number;
  disabled?: boolean;
  onRemove: (index: number) => void;
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
      <div className="rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm cursor-move w-[160px]">
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
          {!disabled && (
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 rounded-md bg-white/90 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-300 hover:border-red-300 transition-colors duration-200 backdrop-blur-sm"
                title="Remove photo"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <div className="p-2 text-sm text-neutral-600 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs">Photo {index + 1}</span>
          </div>
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
  const [isUploading, setIsUploading] = useState(false);

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

  const handlePhotosUpdate = (newPhotos: { link: string }[]) => {
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
                />
              ))}

              {/* Placeholder Upload Buttons */}
              {!disabled && Array.from({ length: placeholdersNeeded }).map((_, index) => (
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
  );
};
