import { useRef } from 'react';
import { PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ProfilePhotoProps {
  photoUrl: string;
  isUploading: boolean;
  onPhotoUpload: (file: File) => Promise<string>;
  onPhotoRemove: () => void;
  fallbackUrl: string;
}

export const ProfilePhoto = ({
  photoUrl,
  isUploading,
  onPhotoUpload,
  onPhotoRemove,
  fallbackUrl
}: ProfilePhotoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-[240px] space-y-2">
        {/* Photo Container */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          {photoUrl ? (
            <img
              src={photoUrl || fallbackUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error loading image:', e);
                e.currentTarget.src = fallbackUrl;
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <PhotoIcon className="h-12 w-12 text-neutral-400" />
            </div>
          )}
        </div>

        {/* Buttons below image */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-md bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 transition-colors duration-200"
            title="Change photo"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={onPhotoRemove}
              className="p-2 rounded-md bg-white dark:bg-neutral-700 hover:bg-red-50 dark:hover:bg-red-900 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-600 hover:border-red-300 dark:hover:border-red-700 transition-colors duration-200"
              title="Remove photo"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPhotoUpload(file);
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};
