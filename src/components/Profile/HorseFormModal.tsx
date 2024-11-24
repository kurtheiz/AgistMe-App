import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Horse } from '../../types/profile';
import { HorseForm } from './HorseForm';

interface HorseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  horse: Horse;
  index: number | null;
  onSave: (horse: Horse) => void;
  onCancel: () => void;
  isUploading: boolean;
  onPhotoUpload: (index: number, file: File) => Promise<void>;
}

export const HorseFormModal = ({
  isOpen,
  onClose,
  horse,
  index,
  onSave,
  onCancel,
  isUploading,
  onPhotoUpload
}: HorseFormModalProps) => {
  const [editedHorse, setEditedHorse] = useState<Horse>({ ...horse });

  const handleHorseChange = (field: string, value: string | number) => {
    setEditedHorse((prev: Horse) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedHorse);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none"
                    onClick={onCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-neutral-900 dark:text-neutral-100 mb-4">
                      {index !== null ? `Edit ${horse.name || 'Horse'}` : 'Add New Horse'}
                    </Dialog.Title>
                    <HorseForm
                      horse={editedHorse}
                      index={index ?? 0}
                      onHorseChange={(_, field, value) => handleHorseChange(field, value)}
                      onDelete={() => {}}
                      isUploading={isUploading}
                      onPhotoUpload={onPhotoUpload}
                    />
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:w-auto"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 sm:mt-0 sm:w-auto"
                        onClick={onCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
