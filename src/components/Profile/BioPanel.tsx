import { CircleUser, ChevronDown } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { BioView } from '../BioView';
import { Profile } from '../../types/profile';

interface BioPanelProps {
  profile: Profile | null;
  onEditClick: () => void;
}

export function BioPanel({ profile, onEditClick }: BioPanelProps) {
  return (
    <div id="bio-section">
      <Disclosure>
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
                  <BioView profile={profile} />
                  <div className="mt-4">
                    <button
                      onClick={onEditClick}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Edit Bio
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
