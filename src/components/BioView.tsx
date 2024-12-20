import React from 'react';
import { Profile } from '../types/profile';
import { MapPin, Phone, Calendar } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { ExpandableText } from './shared/ExpandableText';
import { getInitials } from '../utils/userUtils';

interface BioViewProps {
  profile: Profile;
}

export const BioView: React.FC<BioViewProps> = ({ profile }) => {
  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    return differenceInYears(new Date(), birthDate);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo and Name */}
      <div className="flex items-center space-x-4">
        {profile.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-xl font-medium">
            {getInitials(profile.firstName, profile.lastName)}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-neutral-500">{profile.email}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-neutral-600">
          <Phone className="w-5 h-5 text-neutral-400" />
          <span className={!profile.mobile ? "text-neutral-500" : ""}>
            {profile.mobile || "-"}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-600">
          <Calendar className="w-5 h-5 text-neutral-400" />
          <span>{profile.dateOfBirth ? `${getAge(profile.dateOfBirth)} years old` : '-'}</span>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3 text-neutral-600">
          <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            {!profile.address && !profile.suburb && !profile.state && !profile.postcode && !profile.region ? (
              <p className="text-neutral-500">-</p>
            ) : (
              <>
                {profile.address && <p>{profile.address}</p>}
                {(profile.suburb || profile.state || profile.postcode) && (
                  <p>
                    {[
                      profile.suburb,
                      profile.state,
                      profile.postcode
                    ].filter(Boolean).join(', ')}
                  </p>
                )}
                {profile.region && <p>{profile.region}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {profile.comments && (
        <div className="pt-4 border-t border-neutral-200">
          <ExpandableText 
            text={profile.comments}
            className="text-neutral-600 whitespace-pre-wrap"
          />
        </div>
      )}

      
    </div>
  );
};
