import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment, Status, ListingType } from '../types/agistment';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { useAgistmentStore } from '../stores/agistment.store';
import { useProfile } from '../context/ProfileContext';

const CreateAgistment: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile, loading: profileLoading } = useProfile();

  // Wait for both Clerk and profile to be loaded
  if (!isLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  const createEmptyAgistment = (tempId: string): Agistment => {
    return {
      id: tempId,
      status: 'DRAFT' as Status,
      propertySize: 0,
      arena: false,
      arenas: [],
      contactDetails: {
        email: profile?.email || '',
        name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
        number: profile?.mobile || ''
      },
      createdAt: null,
      description: '',
      feedRoom: {
        available: false,
        comments: ''
      },
      floatParking: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      fullCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      geohash: profile?.geohash || '',
      groupPaddocks: {
        available: 0,
        comments: '',
        total: 0,
        weeklyPrice: 0,
        whenAvailable: null
      },
      GSI1PK: '',
      hidden: false,
      hotWash: {
        available: false,
        comments: ''
      },
      listingType: 'STANDARD' as ListingType,
      location: {
        address: profile?.address || '',
        postCode: profile?.postcode || '',
        region: profile?.region || '',
        state: profile?.state || '',
        suburb: profile?.suburb || '',
        hidden: false
      },
      modifiedAt: new Date().toISOString(),
      name: '',
      partCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      photos: [],
      privatePaddocks: {
        available: 0,
        comments: '',
        total: 0,
        weeklyPrice: 0,
        whenAvailable: null
      },
      roundYard: false,
      roundYards: [],
      selfCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      services: [],
      sharedPaddocks: {
        available: 0,
        comments: '',
        total: 0,
        weeklyPrice: 0,
        whenAvailable: null
      },
      socialMedia: [],
      stables: {
        available: false,
        comments: '',
        quantity: 0
      },
      tackRoom: {
        available: false,
        comments: ''
      },
      tieUp: {
        available: false,
        comments: ''
      },
      urgentAvailability: false
    };
  };

  const handleCreateFromText = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    const tempId = `temp_${Date.now()}`;

    try {
      // Call the API
      const result = await agistmentService.createFromText(text);
      
      // Add profile information to the result
      const agistmentWithProfile = {
        ...result,
        contactDetails: {
          email: profile?.email || '',
          name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
          number: profile?.mobile || ''
        },
        location: {
          address: profile?.address || result.location.address,
          postCode: profile?.postcode || result.location.postCode,
          region: profile?.region || result.location.region,
          state: profile?.state || result.location.state,
          suburb: profile?.suburb || result.location.suburb,
          hidden: false
        },
        geohash: profile?.geohash || result.geohash
      };
      
      // Store the result in Zustand store
      useAgistmentStore.getState().setTempAgistment(tempId, agistmentWithProfile);
      useAgistmentStore.getState().setTempAgistmentText(tempId, text);
      navigate(`/agistments/${tempId}/edit`);
    } catch (error) {
      console.error('Error creating agistment from text:', error);
      toast.error('Could not generate agistment from text. Starting with a blank form instead.');
      
      // Create an empty agistment with profile details
      const emptyAgistment = createEmptyAgistment(tempId);
      
      // Store the empty agistment and the original text
      useAgistmentStore.getState().setTempAgistment(tempId, emptyAgistment);
      useAgistmentStore.getState().setTempAgistmentText(tempId, text);
      
      // Navigate to edit page
      navigate(`/agistments/${tempId}/edit`);
    } finally {
      setIsGenerating(false);
      setText('');
    }
  };

  const handleCreateFromScratch = () => {
    const tempId = `temp_${Date.now()}`;
    const blankAgistment = {
      id: tempId,
      name: 'New Agistment',
      description: '',
      status: 'DRAFT' as Status,
      arena: false,
      arenas: [],
      contactDetails: {
        email: profile?.email || '',
        name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
        number: profile?.mobile || ''
      },
      createdAt: new Date().toISOString(),
      feedRoom: {
        available: false,
        comments: ''
      },
      floatParking: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      fullCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      geohash: profile?.geohash || '',
      groupPaddocks: {
        total: 0,
        available: 0,
        comments: '',
        weeklyPrice: 0,
        whenAvailable: null
      },
      GSI1PK: '',
      hidden: false,
      hotWash: {
        available: false,
        comments: ''
      },
      listingType: 'PRIVATE' as ListingType,
      location: {
        address: profile?.address || '',
        hidden: false,
        postCode: profile?.postcode || '',
        region: profile?.region || '',
        state: profile?.state || '',
        suburb: profile?.suburb || ''
      },
      modifiedAt: new Date().toISOString(),
      propertySize: 0,
      partCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      photos: [],
      privatePaddocks: {
        total: 0,
        available: 0,
        comments: '',
        weeklyPrice: 0,
        whenAvailable: null
      },
      roundYard: false,
      roundYards: [],
      selfCare: {
        available: false,
        comments: '',
        monthlyPrice: 0
      },
      services: [],
      sharedPaddocks: {
        total: 0,
        available: 0,
        comments: '',
        weeklyPrice: 0,
        whenAvailable: null
      },
      socialMedia: [],
      stables: {
        available: false,
        comments: '',
        quantity: 0
      },
      tackRoom: {
        available: false,
        comments: ''
      },
      tieUp: {
        available: false,
        comments: ''
      },
      urgentAvailability: false
    };

    useAgistmentStore.getState().setTempAgistment(tempId, blankAgistment);
    navigate(`/agistments/${tempId}/edit`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Agistment</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create from Text</h2>
          
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your agistment property here..."
              className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isGenerating}
            />
            
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
              <button
                onClick={handleCreateFromText}
                disabled={!text.trim() || !isSignedIn}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignedIn ? 'Create from Text' : 'Sign in to Create'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleCreateFromScratch}
            disabled={!isSignedIn}
            className="w-full py-2 px-4 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignedIn ? 'Or Create from Scratch' : 'Sign in to Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { CreateAgistment };
