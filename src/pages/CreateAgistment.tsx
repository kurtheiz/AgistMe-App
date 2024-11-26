import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { useAgistmentStore } from '../stores/agistment.store';

const CreateAgistment: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateFromText = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    const tempId = `temp_${Date.now()}`;

    try {
      // Create a blank agistment to store the text
      const blankAgistment = {
        id: tempId,
        name: 'New Agistment',
        description: '',
        status: 'DRAFT',
        arena: false,
        arenas: [],
        contactDetails: {
          email: '',
          name: '',
          number: ''
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
        geohash: '',
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
        listingType: 'PRIVATE',
        location: {
          address: '',
          hidden: false,
          postCode: '',
          region: '',
          state: '',
          suburb: ''
        },
        modifiedAt: new Date().toISOString(),
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

      // Store the text and blank agistment
      useAgistmentStore.getState().setTempAgistmentText(tempId, text);
      useAgistmentStore.getState().setTempAgistment(tempId, blankAgistment);

      // Call the API
      const result = await agistmentService.createFromText(text);
      
      // Store the result in Zustand store
      useAgistmentStore.getState().setTempAgistment(tempId, result);
      navigate(`/agistments/${tempId}/edit`);
    } catch (error) {
      console.error('Error creating agistment:', error);
      toast.error('Failed to create agistment');
    } finally {
      setIsGenerating(false);
      setText('');
    }
  };

  if (!isLoaded) {
    return null;
  }

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
      </div>
    </div>
  );
};

export { CreateAgistment };
