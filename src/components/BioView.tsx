import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { PageToolbar } from './PageToolbar';
import { ArrowLeftIcon } from './Icons';
import Bio from './Bio';

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
            <Bio />
          )}
        </div>
      </div>
    </div>
  );
}
