import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { PageToolbar } from './PageToolbar';
import { ArrowLeftIcon } from './Icons';

export default function BioView() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <PageToolbar 
        actions={
          <div className="w-full flex items-center -ml-2 sm:-ml-3">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-600 mx-1">|</span>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <span>Profile</span>
                <span className="text-neutral-300 dark:text-neutral-600">&gt;</span>
                <span>Bio</span>
              </div>
            </div>
          </div>
        }
      />
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">My Bio</h2>
          
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading profile</div>
          ) : (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-4">
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover bg-neutral-100 dark:bg-neutral-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                    <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                    {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'No name provided'}
                  </h3>
                </div>
              </div>

              {/* Bio Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Mobile
                  </label>
                  <p className="mt-1 text-neutral-900 dark:text-white">
                    {profile?.mobile || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Date of Birth
                  </label>
                  <p className="mt-1 text-neutral-900 dark:text-white">
                    {profile?.dateOfBirth || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      Street Address
                    </label>
                    <p className="mt-1 text-neutral-900 dark:text-white">
                      {profile?.address || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      Suburb
                    </label>
                    <p className="mt-1 text-neutral-900 dark:text-white">
                      {profile?.suburb || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      State
                    </label>
                    <p className="mt-1 text-neutral-900 dark:text-white">
                      {profile?.state || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      Postcode
                    </label>
                    <p className="mt-1 text-neutral-900 dark:text-white">
                      {profile?.postcode || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  About
                </label>
                <p className="mt-1 text-neutral-900 dark:text-white whitespace-pre-wrap">
                  {profile?.comments || 'No additional information provided'}
                </p>
              </div>

              {/* Horse Experience */}
              {profile.horseExperience && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Horse Experience</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">{profile.horseExperience}</p>
                </div>
              )}

              {/* Availability */}
              {profile.availability && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Availability</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">{profile.availability}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
