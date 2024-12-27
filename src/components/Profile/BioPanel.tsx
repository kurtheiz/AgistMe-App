import { CircleUser, ChevronDown, Pencil } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Profile } from '../../types/profile';
import { BioView } from '../BioView';

interface BioPanelProps {
  profile: Profile | null;
  onEditClick: () => void;
  isDefaultOpen?: boolean;
}

export function BioPanel({ profile, onEditClick, isDefaultOpen = true }: BioPanelProps) {
  return (
    <div id="bio-section">
      <Disclosure defaultOpen={isDefaultOpen}>
        {({ open }) => (
          <div className="bg-white rounded-lg shadow-sm">
            <DisclosureButton className="w-full px-4 py-4 text-left flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CircleUser className="w-5 h-5 text-neutral-500" />
                <h2 className="text-lg font-medium">My Bio</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`} />
            </DisclosureButton>
            <DisclosurePanel className="px-6 pb-6">
              {profile && (
                <div>
                  <div className="flex items-start justify-between">
                    <BioView profile={profile} />
                    <button
                      onClick={onEditClick}
                      className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Edit Bio"
                    >
                      <Pencil className="w-5 h-5 text-neutral-400" />
                    </button>
                  </div>
                </div>
              )}
            </DisclosurePanel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
