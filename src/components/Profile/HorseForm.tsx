import { Horse } from '../../types/profile';
import { Trash } from 'lucide-react';
import { HorsePhoto } from './HorsePhoto';

interface HorseFormProps {
  horse: Horse;
  index: number;
  onHorseChange: (index: number, field: string, value: string | number) => void;
  onDelete: (index: number) => void;
  isUploading: boolean;
  onPhotoUpload: (index: number, file: File) => Promise<void>;
}

export const HorseForm = ({
  horse,
  index,
  onHorseChange,
  onDelete,
  isUploading,
  onPhotoUpload
}: HorseFormProps) => {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-4">
      {/* Header with Delete Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {horse.name || 'New Horse'}
        </h3>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <span className="sr-only">Delete</span>
          <Trash className="h-5 w-5" />
        </button>
      </div>

      {/* Horse Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Horse Details */}
        <div className="space-y-4">
          {/* Horse Name */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Horse Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={horse.name}
              onChange={(e) => onHorseChange(index, 'name', e.target.value)}
              required
              placeholder="Enter horse name"
              className="form-input form-input-compact"
            />
          </div>

          {/* Breed */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Breed <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={horse.breed}
              onChange={(e) => onHorseChange(index, 'breed', e.target.value)}
              required
              placeholder="Enter breed"
              className="form-input form-input-compact"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={horse.gender}
              onChange={(e) => onHorseChange(index, 'gender', e.target.value)}
              required
              className="form-input form-input-compact"
            >
              <option value="">Select Gender</option>
              <option value="Colt">Colt</option>
              <option value="Filly">Filly</option>
              <option value="Gelding">Gelding</option>
              <option value="Mare">Mare</option>
              <option value="Stallion">Stallion</option>
            </select>
          </div>

          {/* Color and Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Colour <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={horse.colour}
                onChange={(e) => onHorseChange(index, 'colour', e.target.value)}
                required
                placeholder="Enter colour"
                className="form-input form-input-compact"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Size (hh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={horse.size}
                onChange={(e) => onHorseChange(index, 'size', parseFloat(e.target.value) || 0)}
                required
                step="0.1"
                min="8"
                max="20"
                className="form-input form-input-compact"
              />
            </div>
          </div>

          {/* Birth Year and Age */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Birth Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={horse.yearOfBirth}
                onChange={(e) => onHorseChange(index, 'yearOfBirth', parseInt(e.target.value) || new Date().getFullYear())}
                required
                min={1980}
                max={new Date().getFullYear()}
                className="form-input form-input-compact"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Age
              </label>
              <div className="mt-1 form-input form-input-compact bg-neutral-100 dark:bg-neutral-800">
                {horse.yearOfBirth ? new Date().getFullYear() - horse.yearOfBirth : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Photo and Comments */}
        <div className="flex flex-col h-full">
          {/* Horse Photo */}
          <HorsePhoto
            photoUrl={horse.photo || ''}
            isUploading={isUploading}
            onPhotoUpload={(file) => onPhotoUpload(index, file)}
            onPhotoRemove={() => onHorseChange(index, 'photo', '')}
            horseName={horse.name || 'Horse'}
          />

          {/* Comments Section */}
          <div className="flex-1 flex flex-col mt-4 h-full">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              About
            </label>
            <textarea
              value={horse.description || ''}
              onChange={(e) => onHorseChange(index, 'description', e.target.value)}
              className="form-textarea flex-1 min-h-[120px]"
              placeholder={`Tell us more about ${horse.name || 'your horse'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
