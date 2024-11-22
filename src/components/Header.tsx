import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  useAuthToken();
  const { refreshProfile } = useProfile();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshProfile();
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

  // Get the current search hash if it exists
  const searchHash = searchParams.get('q');
  const agistmentsPath = searchHash ? `/agistments/search?q=${searchHash}` : '/agistments/search';

  return (
    <header className={`bg-white dark:bg-neutral-900 w-full ${location.pathname !== '/' && 'border-b border-neutral-200 dark:border-neutral-800'}`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
            >
              <img src="/AgistMeLogo.svg" alt="Agist Me Logo" className="h-9 w-9 sm:h-10 sm:w-10 dark:invert" />
              <span>Agist Me</span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/about" className="text-base sm:text-lg text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">About</Link>
              <Link 
                to={agistmentsPath}
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
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={isSignedIn ? 'Go to profile' : 'Sign In'}
              >
                {isSignedIn && user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User avatar'} 
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
                    />
                  </svg>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
