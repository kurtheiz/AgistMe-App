import React from 'react';
import { Profile } from '../types/profile';
import { MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ExpandableText } from './shared/ExpandableText';

interface BioViewProps {
  profile: Profile;
}

export const BioView: React.FC<BioViewProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Profile Photo and Name */}
      <div className="flex items-center space-x-4">
        <img
          src={profile.profilePhoto}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-20 h-20 rounded-full object-cover"
        />
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
          <span>{profile.mobile}</span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-600">
          <Mail className="w-5 h-5 text-neutral-400" />
          <span>{profile.email}</span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-600">
          <Calendar className="w-5 h-5 text-neutral-400" />
          <span>{profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'dd MMMM yyyy') : 'Not specified'}</span>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3 text-neutral-600">
          <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <p>{profile.address}</p>
            <p>{profile.suburb}, {profile.state} {profile.postcode}</p>
            <p>{profile.region}</p>
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

      {/* Profile Sharing Settings */}
      <div className="pt-4 border-t border-neutral-200">
        <div className="flex items-center">
          <span className="text-sm text-neutral-500">Show Profile in Enquiries</span>
          <span className="text-sm font-medium ml-4">
            {profile.showProfileInEnquiry ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};
