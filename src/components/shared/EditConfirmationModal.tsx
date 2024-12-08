import { Modal } from './Modal';

interface EditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hideAgistment: boolean) => void;
  isUpdating?: boolean;
  currentlyHidden?: boolean;
}

export const EditConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isUpdating = false,
  currentlyHidden = false
}: EditConfirmationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Agistment Listing"
      size="sm"
      isUpdating={isUpdating}
    >
      <div className="space-y-4">
        <p className="text-neutral-700">
          Would you like to hide this agistment listing while you make changes? Hidden listings will not appear in search results.
        </p>
        {currentlyHidden && (
          <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
            Note: This listing is currently hidden. Editing without hiding will keep it hidden.
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm(true)}
            className="button-primary w-full text-center justify-center"
          >
            Hide and Edit
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="button-secondary w-full text-center justify-center"
          >
            Edit Without Hiding
          </button>
        </div>
      </div>
    </Modal>
  );
};
