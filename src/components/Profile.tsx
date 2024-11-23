import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { PageToolbar } from './PageToolbar';
import { ArrowRightOnRectangleIcon } from './Icons';

export default function Profile() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { profile, loading, error, refreshProfile } = useProfile();

  // If profile is not loaded yet, try to load it
  if (isLoaded && isSignedIn && !profile && !loading && !error) {
    refreshProfile(true);
  }

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <PageToolbar 
        actions={
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile/view')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              View Bio
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        }
      />
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div 
            onClick={() => navigate('/profile/bio')}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 h-[280px] cursor-pointer hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Profile</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
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
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                    {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Profile'}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    First Name
                  </label>
                  <p className="mt-1 text-neutral-900 dark:text-white">
                    {profile?.firstName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Last Name
                  </label>
                  <p className="mt-1 text-neutral-900 dark:text-white">
                    {profile?.lastName || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* My Horses Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 h-[280px]">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">My Horses</h2>
            
            <div className="flex flex-col items-center justify-center h-[calc(100%-3.5rem)] text-center space-y-4">
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

          {/* Favourites Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 h-[280px]">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Favourites</h2>

            <div className="flex flex-col items-center justify-center h-[calc(100%-3.5rem)] text-center space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <span className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                  {profile?.favourites?.length || 0}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {profile?.favourites?.length === 0
                  ? "Save your favourite properties here"
                  : profile?.favourites?.length === 1
                  ? "1 favourite property"
                  : `${profile?.favourites?.length} favourite properties`
                }
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 h-[280px]">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Settings</h2>

            <div className="flex flex-col items-center justify-center h-[calc(100%-3.5rem)] text-center space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <svg className="w-6 h-6 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Configure your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
