import { Mail, Phone } from 'lucide-react';
import { AgistmentContact, AgistmentBasicInfo, AgistmentPropertyLocation, AgistmentDescription } from '../../types/agistment';
import { getGoogleMapsUrl } from '../../utils/location';
import { useState } from 'react';

interface Props {
  basicInfo: AgistmentBasicInfo;
  propertyLocation: AgistmentPropertyLocation;
  contactDetails: AgistmentContact;
  propertyDescription: AgistmentDescription;
}

export const AgistmentHeader = ({
  basicInfo,
  propertyLocation,
  contactDetails,
  propertyDescription
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldShowLoadMore = propertyDescription?.description && propertyDescription.description.split('\n').length > 4;

  return (
    <>
      {/* Basic Info Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {basicInfo.name || 'Unnamed Agistment'}
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
        {/* Location Section */}
        {propertyLocation?.location && (
          <div>
            
            <p className="text-neutral-900 dark:text-neutral-100">
              <a
                href={getGoogleMapsUrl(propertyLocation.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600"
              >
                {[
                  propertyLocation.location.address,
                  propertyLocation.location.suburb,
                  propertyLocation.location.state,
                  propertyLocation.location.postcode
                ].filter(Boolean).join(', ')}
              </a>
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {basicInfo.propertySize > 0 
                ? <>Property is located on <strong className="text-neutral-900 dark:text-neutral-100">{basicInfo.propertySize} acres</strong> in the <strong className="text-neutral-900 dark:text-neutral-100">{propertyLocation.location.region}</strong> region</>
                : <>Located in the <strong className="text-neutral-900 dark:text-neutral-100">{propertyLocation.location.region}</strong> region</>
              }
            </p>
          </div>
        )}

        {/* Contact Section */}
        {contactDetails?.contactDetails && (
          <div>
            <div className="space-y-2">
              {contactDetails.contactDetails.name && (
                <div className="text-neutral-900 dark:text-neutral-100">
                  <span>{contactDetails.contactDetails.name}</span>
                </div>
              )}
              {contactDetails.contactDetails.email && (
                <div className="flex items-center text-neutral-900 dark:text-neutral-100">
                  <Mail className="w-4 h-4 mr-2" />
                  <a 
                    href={`mailto:${contactDetails.contactDetails.email}`}
                    className="hover:text-primary-600"
                  >
                    {contactDetails.contactDetails.email}
                  </a>
                </div>
              )}
              {contactDetails.contactDetails.number && (
                <div className="flex items-center text-neutral-900 dark:text-neutral-100">
                  <Phone className="w-4 h-4 mr-2" />
                  <a 
                    href={`tel:${contactDetails.contactDetails.number}`}
                    className="hover:text-primary-600"
                  >
                    {contactDetails.contactDetails.number}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Property Description Section */}
      <div className="mt-6">
        {propertyDescription?.description && (
          <div>
            <div className="relative">
              <div 
                className={`text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap ${
                  !isExpanded ? 'line-clamp-4' : ''
                }`}
              >
                {propertyDescription.description}
              </div>
              {!isExpanded && shouldShowLoadMore && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent" />
              )}
            </div>
            {shouldShowLoadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
