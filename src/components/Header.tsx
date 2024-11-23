import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useAuthToken } from '../hooks/useAuthToken';
import { useProfile } from '../context/ProfileContext';
import { useEffect } from 'react';

export const Header = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  useAuthToken();
  const { refreshProfile } = useProfile();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshProfile(false);
    }
  }, [isLoaded, isSignedIn, refreshProfile]);

  const handleAvatarClick = () => {
    if (isSignedIn) {
      navigate('/profile', { replace: true });
    } else {
      openSignIn({
        afterSignInUrl: location.pathname,
      });
    }
  };

  return (
    <header className="bg-white dark:bg-neutral-900 w-full border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              to="/" 
              onClick={() => {
                // Clear the stored search from localStorage
                localStorage.removeItem('agistme_last_search');
              }} 
              className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
            >
              <img src="/AgistMeLogo.svg" alt="Agist Me Logo" className="h-9 w-9 sm:h-10 sm:w-10 dark:invert" />
              <span>Agist Me</span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/about" className="text-base sm:text-lg text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">About</Link>
              <Link 
                to="/agistments/search"
                className="text-base sm:text-lg text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                Agistments
              </Link>
              <Link to="/Pricing" className="text-base sm:text-lg text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Pricing</Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-5 z-50">
            <ThemeToggle />
            {isLoaded ? (
              <button
                onClick={handleAvatarClick}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isSignedIn ? 'Go to profile' : 'Sign In'}
              >
                {isSignedIn && user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User avatar'} 
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                  />
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                )}
              </button>
            ) : (
              // Show a placeholder while loading
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
