import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="border-t dark:border-gray-700 pt-6">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
