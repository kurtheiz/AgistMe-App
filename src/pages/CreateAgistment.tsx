import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../context/ProfileContext';
import { useListingTypeStore } from '../stores/listingType.store';

const CreateAgistment: React.FC = () => {
  const navigate = useNavigate();
  const { selectedType } = useListingTypeStore();
  const { isLoaded } = useUser();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasClickedCreateFromText, setHasClickedCreateFromText] = useState(false);
  const { profile, loading: profileLoading } = useProfile();
  const [useProfileData] = useState(true);

  // Wait for both Clerk and profile to be loaded
  if (!isLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  // Check if profile has any relevant data
  const hasProfileData = profile && (
    profile.email ||
    profile.firstName ||
    profile.lastName ||
    profile.mobile ||
    profile.address ||
    profile.suburb ||
    profile.state ||
    profile.postcode
  );

  const placeholderText = `Horse agistment available in beautiful Samford Valley on our 10 acre property. We have 4 private paddocks available with access to a large sand arena, secure tack room and feed shed. Property has excellent facilities including float parking and a round yard.

Agistment is $100 per week which includes quality pasture, daily water checks and hay supplementation in winter. All agistees have full use of facilities and will be joining a great community of like-minded horse owners. Available from March 1st.`;

  const createEmptyAgistment = (tempId: string): AgistmentResponse => {
    return {
      id: tempId,
      GSI1PK: '',
      geohash: '',
      status: 'DRAFT',
      listing: { listingType: selectedType.listingType },
      basicInfo: {
        name: '',
        propertySize: 0
      },
      propertyLocation: {
        location: useProfileData && hasProfileData ? {
          address: profile?.address || '',
          postcode: profile?.postcode || '',
          region: profile?.region || '',
          state: profile?.state || '',
          suburb: profile?.suburb || ''
        } : {
          address: '',
          suburb: '',
          state: '',
          postcode: '',
          region: ''
        }
      },
      contact: {
        contactDetails: useProfileData && hasProfileData ? {
          name: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
          email: profile?.email || '',
          number: profile?.mobile || ''
        } : {
          name: '',
          email: '',
          number: ''
        }
      },
      propertyDescription: {
        description: ''
      },
      facilities: {
        feedRoom: { available: false, comments: '' },
        floatParking: { available: false, comments: '', monthlyPrice: 0 },
        hotWash: { available: false, comments: '' },
        tackRoom: { available: false, comments: '' },
        tieUp: { available: false, comments: '' },
        stables: { available: false, comments: '', quantity: 0 }
      },
      visibility: {
        hidden: true
      },
      ridingFacilities: {
        arenas: [],
        roundYards: []
      },
      paddocks: {
        groupPaddocks: {
          available: 0,
          comments: '',
          total: 0,
          weeklyPrice: 0,
          totalPaddocks: 0
        },
        privatePaddocks: {
          available: 0,
          comments: '',
          total: 0,
          weeklyPrice: 0,
          totalPaddocks: 0
        },
        sharedPaddocks: {
          available: 0,
          comments: '',
          total: 0,
          weeklyPrice: 0,
          totalPaddocks: 0
        },
        paddocks: []
      },
      photoGallery: {
        photos: []
      },
      propertyServices: {
        services: []
      },
      care: {
        fullCare: { available: false, comments: '', monthlyPrice: 0 },
        partCare: { available: false, comments: '', monthlyPrice: 0 },
        selfCare: { available: false, comments: '', monthlyPrice: 0 }
      },
      socialMedia: [],
      urgentAvailability: false
    };
  };

  const handleCreateFromText = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    const tempId = `temp_${Date.now()}`;

    try {
      // Call the API to create from text
      const result = await agistmentService.createFromText(text);
      
      // Add profile information to the result
      const agistmentWithProfile: Partial<AgistmentResponse> = {
        ...result,
        listing: { listingType: selectedType.listingType },
        contact: {
          contactDetails: useProfileData ? {
            name: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
            email: profile?.email || '',
            number: profile?.mobile || ''
          } : {
            name: '',
            email: '',
            number: ''
          }
        },
        propertyLocation: useProfileData ? {
          location: {
            address: profile?.address || result.propertyLocation?.location?.address || '',
            postcode: profile?.postcode || result.propertyLocation?.location?.postcode || '',
            region: profile?.region || result.propertyLocation?.location?.region || '',
            state: profile?.state || result.propertyLocation?.location?.state || '',
            suburb: profile?.suburb || result.propertyLocation?.location?.suburb || ''
          }
        } : {
          location: {
            address: '',
            postcode: '',
            region: '',
            state: '',
            suburb: ''
          }
        }
      };
      
      // Save the agistment
      const savedAgistment = await agistmentService.updateAgistment(tempId, agistmentWithProfile);
      
      // Navigate to edit page
      navigate(`/agistments/${savedAgistment.PK}/edit`);
    } catch (error) {
      console.error('Error creating agistment:', error);
      toast.error('Failed to create agistment. Please try again.');
    } finally {
      setIsGenerating(false);
      setHasClickedCreateFromText(true);
    }
  };

  const handleCreateEmpty = async () => {
    const tempId = `temp_${Date.now()}`;
    const emptyAgistment = createEmptyAgistment(tempId);
    
    try {
      // Save the agistment
      const savedAgistment = await agistmentService.updateAgistment(tempId, emptyAgistment);
      
      // Navigate to edit page
      navigate(`/agistments/${savedAgistment.PK}/edit`);
    } catch (error) {
      console.error('Error creating empty agistment:', error);
      toast.error('Failed to create agistment. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Create a New Agistment Listing - {selectedType.listingType}</h1>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Information you'll need:</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Property details (size, location)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Available facilities (paddocks, stables, arena, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Pricing information for different services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact details (email, phone number)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Property photos (recommended but optional)</span>
              </li>
            </ul>
            <p className="text-m font-bold text-gray-500 dark:text-gray-400 mt-3">
              Don't worry if you don't have all the information yet - you can set your listing as hidden and complete it later.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-neutral-900 dark:text-white">
                Use my profile data
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Automatically fill in your contact details and address from your profile, if the data exists
                {!hasProfileData && (
                  <span className="block mt-1 text-neutral-400 dark:text-neutral-500">
                    No profile data available. Please update your profile first.
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Create from Text</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-neutral-800 dark:text-neutral-200">
                Simply paste your existing social media listing here, or describe your agistment property in your own words. We'll help format it into a proper listing for you! Don't worry, you'll be able to review and edit everything on the next page.
              </p>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                onFocus={() => {}}
                placeholder={placeholderText}
                className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
            
            {isGenerating ? (
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                <p className="text-lg font-medium text-gray-700">
                  Generating your listing automagically...
                </p>
                <p className="text-sm text-gray-500">
                  We're analyzing your text and creating a detailed listing for you.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setHasClickedCreateFromText(true);
                    handleCreateFromText();
                  }}
                  disabled={!text.trim()}
                  className="py-2 px-8 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create from Text
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="text-2xl font-semibold text-neutral-600 dark:text-neutral-400">OR</div>
          <button
            onClick={handleCreateEmpty}
            disabled={hasClickedCreateFromText}
            className="py-2 px-8 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create from Scratch
          </button>
        </div>
      </div>
    </div>
  );
};

export { CreateAgistment };
