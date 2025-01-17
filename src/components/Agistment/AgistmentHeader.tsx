import { Mail, Phone, Facebook, Globe, Instagram } from 'lucide-react';
import { AgistmentContact, AgistmentBasicInfo, AgistmentPropertyLocation, AgistmentDescription } from '../../types/agistment';
import { ExpandableText } from '../shared/ExpandableText';

interface Props {
  basicInfo?: AgistmentBasicInfo;
  propertyLocation?: AgistmentPropertyLocation;
  contactDetails?: AgistmentContact;
  propertyDescription?: AgistmentDescription;
  socialMedia?: { type: string; link: string }[];
}

export const AgistmentHeader = ({
  basicInfo,
  propertyLocation,
  contactDetails,
  propertyDescription,
  socialMedia
}: Props) => {
  return (
    <>
      {/* Basic Info Section */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {basicInfo?.name || 'Unnamed Agistment'}
        </h1>
      </div>
      
      <div className="space-y-6 w-full mt-4">
        {/* Location Section */}
        {propertyLocation?.location && (
          <div>
            <p className="text-neutral-900 dark:text-neutral-100">
              {[
                propertyLocation.location.address,
                propertyLocation.location.suburb,
                propertyLocation.location.state,
                propertyLocation.location.postcode
              ].filter(Boolean).join(', ')}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {basicInfo?.propertySize && basicInfo.propertySize > 0 
                ? <>Property is located on <strong className="text-neutral-900 dark:text-neutral-100">{basicInfo.propertySize} acres</strong> in the <strong className="text-neutral-900 dark:text-neutral-100">{propertyLocation.location.region}</strong> region</>
                : <>Located in the <strong className="text-neutral-900 dark:text-neutral-100">{propertyLocation.location.region}</strong> region</>
              }
            </p>
          </div>
        )}

        {/* Contact Section */}
        {contactDetails?.contactDetails && (
          <div className="space-y-3">
            {/* Name on its own line */}
            {contactDetails.contactDetails.name && (
              <div className="text-neutral-900 dark:text-neutral-100">
                <span>{contactDetails.contactDetails.name}</span>
              </div>
            )}
            
            {/* Contact details and social media in single line */}
            <div className="flex flex-wrap items-center gap-4">
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
              {/* Social Media Links */}
              {socialMedia && socialMedia.map((social) => (
                <div key={social.type} className="flex items-center text-neutral-900 dark:text-neutral-100">
                  {social.type === 'facebook' && (
                    <>
                      <Facebook className="w-4 h-4 mr-2" />
                      <a 
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600"
                      >
                        Facebook Page
                      </a>
                    </>
                  )}
                  {social.type === 'instagram' && (
                    <>
                      <Instagram className="w-4 h-4 mr-2" />
                      <a 
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600"
                      >
                        Instagram Page
                      </a>
                    </>
                  )}
                  {(social.type === 'web' || social.type === 'website') && (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      <a 
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600"
                      >
                        Website
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Property Description Section */}
      {propertyDescription?.description && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Property Description</h3>
          <ExpandableText 
            text={propertyDescription.description}
            className="text-neutral-600 dark:text-neutral-300"
            mobileThreshold={200}
            desktopThreshold={400}
          />
        </div>
      )}
      
    </>
  );
};
