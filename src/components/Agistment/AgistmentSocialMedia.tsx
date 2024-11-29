import { Pencil } from 'lucide-react';

interface SocialMediaLink {
  type: string;
  link: string;
}

interface AgistmentSocialMediaProps {
  socialMedia: SocialMediaLink[];
  isEditable?: boolean;
}

export const AgistmentSocialMedia: React.FC<AgistmentSocialMediaProps> = ({
  socialMedia,
  isEditable = false
}) => {
  return (
    <div className="agistment-section">
      <div className="agistment-section-header">
        <h2 className="agistment-section-title">Social Media & Links</h2>
        {isEditable && (
          <button className="btn-edit">
            <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
      </div>
      <div className="agistment-section-content">
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
    </div>
  );
};
