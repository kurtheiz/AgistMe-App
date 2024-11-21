import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useAuthToken } from '../hooks/useAuthToken';
import { Search } from './Search/Search';
import { useState } from 'react';

export const Header = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  useAuthToken();

  const handleAvatarClick = () => {
    if (isSignedIn) {
      navigate('/profile', { replace: true });
    } else {
      openSignIn({
        afterSignInUrl: location.pathname,
      });
    }
  };

  const handleSignUpClick = () => {
    openSignUp({
      afterSignUpUrl: location.pathname,
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">AgistMe</Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/about" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">About</Link>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                Search
              </button>
              <Link to="/Pricing" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Pricing</Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 z-50">
            <ThemeToggle />
            {isLoaded ? (
              <>
                {!isSignedIn && (
                  <button
                    onClick={handleSignUpClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Sign Up
                  </button>
                )}
                <button
                  onClick={handleAvatarClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={isSignedIn ? 'Go to profile' : 'Sign In'}
                >
                  {isSignedIn && user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User avatar'} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-gray-600 dark:text-gray-300" 
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
              </>
            ) : (
              // Show a placeholder while loading
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
      <Search isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </header>
  );
};
