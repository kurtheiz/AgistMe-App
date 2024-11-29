import { EditIcon } from '../../components/Icons';
import { Agistment } from '../../types/agistment';

interface AgistmentSocialMediaProps {
  agistmentId: string;
  socialMedia: Agistment['socialMedia'];
  isEditable?: boolean;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

export const AgistmentSocialMedia: React.FC<AgistmentSocialMediaProps> = ({
  agistmentId,
  socialMedia,
  isEditable = false,
  onUpdate
}) => {
  return (
    <div className="bg-white dark:bg-transparent p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Social Media & Links</h2>
        {isEditable && (
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      {socialMedia && socialMedia.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {socialMedia.map((social, index) => (
            social.link ? (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
              </a>
            ) : (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400"
              >
                {social.type === 'INSTA' ? 'Instagram' : social.type === 'FB' ? 'Facebook' : 'Website'}
              </span>
            )
          ))}
        </div>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-400">No social media links</p>
      )}
    </div>
  );
};
