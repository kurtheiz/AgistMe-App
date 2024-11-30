import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Bio from '../components/Bio';
import { useProfile } from '../context/ProfileContext';
import { useState, useEffect } from 'react';
import LogoutIcon from "../components/Icons/LogoutIcon";

export default function Profile() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isBioOpen, setIsBioOpen] = useState(false);
  const { profile, refreshProfile, loading, error } = useProfile();

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        if (mounted) {
          await refreshProfile();
        }
      } catch (error) {
        if (mounted) {
          console.error('Error refreshing profile:', error);
        }
      }
    };

    if (isLoaded && isSignedIn && !profile && !loading && !error) {
      loadProfile();
    }

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, profile, loading, error, refreshProfile]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOpenBio = () => {
    setIsBioOpen(true);
  };

  const handleCloseBio = () => {
    setIsBioOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">My Profile</h1>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {/* Profile Card */}
            <div 
              onClick={handleOpenBio}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">My Bio</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.showProfileInEnquiry ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-neutral-700">
                      Bio sharing {profile?.showProfileInEnquiry ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Update your personal contact information and address details here, as well as set your bio privacy
                  </p>
                </div>
              </div>
            </div>

            {/* My Horses Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">My Horses</h2>
                
                <div className="flex-1 flex flex-col items-left justify-left text-left space-y-3">
                  
                  <p className="text-sm text-neutral-600">
                    Add and manage your horses that will appear on your bio
                  </p>
                </div>
              </div>
            </div>

            {/* Favourites Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Favourites</h2>

                <div className="flex-1 flex flex-col items-left justify-left text-left">
                  <p className="text-sm text-neutral-600">
                    Manage your favourited agistment properties as well as notifications for updates
                  </p>
                </div>
              </div>
            </div>

            {/* Searches Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900">Searches</h2>

                <div className="flex flex-col items-left justify-left text-left">
                  <p className="text-sm text-neutral-600">
                    Manage your saved searches and notification preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Modal */}
            <Bio isOpen={isBioOpen} onClose={handleCloseBio} />
          </div>
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto sm:mx-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-3 text-base sm:text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <LogoutIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
