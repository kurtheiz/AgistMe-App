import { useState } from 'react';
import { Modal } from '../../components/shared/Modal';
import { Clipboard } from 'lucide-react';

export function CreateFromSocial() {
  const [isOpen, setIsOpen] = useState(false);
  const [socialText, setSocialText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!socialText.trim()) return;
    
    setIsLoading(true);
    try {
      // TODO: Add the actual service call when available
      // await agistmentService.createFromText(socialText);
      setIsOpen(false);
      setSocialText('');
    } catch (error) {
      console.error('Error creating agistment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Clipboard className="w-4 h-4" />
        Create from Social
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Agistment from Social Media"
        size="lg"
        onAction={handleSubmit}
        actionLabel="Create"
        isUpdating={isLoading}
        disableAction={!socialText.trim()}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="socialText"
              className="block text-sm font-medium text-gray-700"
            >
              Paste your social media post
            </label>
            <textarea
              id="socialText"
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Paste the content from your social media post here..."
              value={socialText}
              onChange={(e) => setSocialText(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500">
            The text will be analyzed to create a new agistment listing.
          </p>
        </div>
      </Modal>
    </>
  );
}
