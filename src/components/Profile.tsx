import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Bio from './Bio';
import { useProfile } from '../context/ProfileContext';
import { useState, useEffect } from 'react';
import LogoutIcon from "./Icons/LogoutIcon";

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
  }, [isLoaded, isSignedIn, profile, loading, error, refreshProfile]); // refreshProfile is now stable, so we can keep empty dependency array

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-12 pt-6">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {/* Profile Card */}
            <div 
              onClick={handleOpenBio}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">My Bio</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.showProfileInEnquiry ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Bio sharing {profile?.showProfileInEnquiry ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover bg-neutral-100 dark:bg-neutral-700"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* My Horses Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">My Horses</h2>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                    <span className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                      {profile?.horses?.length || 0}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {profile?.horses?.length === 0 
                      ? "Adding your horses here will make it easier to find agistment"
                      : profile?.horses?.length === 1
                      ? "1 horse registered"
                      : `${profile?.horses?.length} horses registered`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Favourites Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Favourites</h2>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                    <span className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                      {profile?.favourites?.length || 0}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {profile?.favourites?.length === 0
                      ? "Save your favourite properties here"
                      : profile?.favourites?.length === 1
                      ? "1 favourite agistment"
                      : `${profile?.favourites?.length} favourite agistments`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Searches Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Searches</h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Saved searches and notifications
                      </p>
                    </div>
                  </div>

                  
          
                </div>
              </div>
            </div>

            {/* Bio Modal */}
            <Bio isOpen={isBioOpen} onClose={handleCloseBio} />
          </div>
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto sm:mx-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
