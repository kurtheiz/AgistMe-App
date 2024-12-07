import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useAgistor } from '../hooks/useAgistor';
import { useAuthStore } from '../stores/auth.store';

export const Header = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAgistor, isLoading: isAgistorLoading } = useAgistor();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    if (isSignedIn && user) {
      setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        imageUrl: user.imageUrl,
        role: user.publicMetadata?.role as string,
        metadata: {
          ...user.publicMetadata,
          publicMetadata: user.publicMetadata,
          unsafeMetadata: user.unsafeMetadata,
        },
      });
    } else if (!isSignedIn) {
      clearAuth();
    }
  }, [isSignedIn, user, setUser, clearAuth]);

  const handleAvatarClick = () => {
    if (isSignedIn) {
      navigate('/profile');
    } else {
      openSignIn({
        redirectUrl: `${location.pathname}${location.search}${location.hash}`,
      });
    }
  };

  // Get the current search hash if it exists
  const searchHash = searchParams.get('q');
  const agistmentsPath = searchHash ? `/agistments?q=${searchHash}` : '/agistments';

  // Don't show agistor-specific items while loading
  const showAgistorItems = isAgistor && !isAgistorLoading;

  return (
    <>
      <header className={`bg-white w-full ${location.pathname !== '/' && 'border-b border-neutral-200'} relative z-50`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-1 relative">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Hamburger menu button - visible only on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 -ml-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {!isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
              <Link 
                to="/" 
                className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold text-gray-900"
              >
                <img src="/AgistMeLogo.svg" alt="Agist Me Logo" className="h-9 w-9 sm:h-10 sm:w-10" />
                <span>Agist Me</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link 
                  to={agistmentsPath}
                  className="text-base sm:text text-gray-600 hover:text-primary-600"
                >
                  Agistments
                </Link>
                <Link 
                  to="/listagistment" 
                  className="text-base sm:text text-gray-600 hover:text-primary-600"
                >
                  List Agistment
                </Link>
                {showAgistorItems && (
                  <Link 
                    to="/dashboard"
                    className="text-base sm:text text-gray-600 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-5 z-50">
              {isLoaded ? (
                isSignedIn ? (
                  <button
                    onClick={handleAvatarClick}
                    className="flex items-center justify-center"
                    aria-label="Go to profile"
                  >
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User avatar'} 
                      className="h-8 w-8 rounded-full"
                    />
                  </button>
                ) : (
                  <button
                    onClick={handleAvatarClick}
                    className="flex items-center justify-center"
                    aria-label="Sign In"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-8 h-8 text-gray-600"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 bg-white transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <nav className="flex flex-col p-4 space-y-4 border-t border-neutral-200">
          <Link 
            to="/"
            className="text-base text-gray-600 hover:text-primary-600 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/about"
            className="text-base text-gray-600 hover:text-primary-600 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to={agistmentsPath}
            className="text-base text-gray-600 hover:text-primary-600 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agistments
          </Link>
          <Link 
            to="/listagistment" 
            className="text-base text-gray-600 hover:text-primary-600 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            List Agistment
          </Link>
          {showAgistorItems && (
            <Link 
              to="/dashboard"
              className="text-base text-gray-600 hover:text-primary-600 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};
