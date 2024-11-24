import { useRef } from 'react';
import { PencilSquareIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface ProfilePhotoProps {
  photoUrl: string;
  isUploading: boolean;
  onPhotoUpload: (file: File) => void;
  onPhotoRemove: () => void;
  disabled?: boolean;
}

export const ProfilePhoto = ({
  photoUrl,
  isUploading,
  onPhotoUpload,
  onPhotoRemove,
  disabled = false
}: ProfilePhotoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-[240px] space-y-2">
        {/* Photo Container */}
        <div className="h-[240px] w-[240px] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="w-32 h-32 text-neutral-300 dark:text-neutral-600" />
            </div>
          )}
        </div>

        {/* Buttons below image */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => !disabled && fileInputRef.current?.click()}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors duration-200 ${
              disabled
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border-neutral-300 dark:border-neutral-700'
                : 'bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
            }`}
            title="Change photo"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={onPhotoRemove}
              disabled={disabled}
              className={`p-2 rounded-md transition-colors duration-200 ${
                disabled
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border-neutral-300 dark:border-neutral-700'
                  : 'bg-white dark:bg-neutral-700 hover:bg-red-50 dark:hover:bg-red-900 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-600 hover:border-red-300 dark:hover:border-red-700'
              }`}
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
          disabled={disabled}
        />
      </div>
    </div>
  );
};
