import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useAgistor } from '../hooks/useAgistor';
import { useAuthStore } from '../stores/auth.store';
import { useSearchStore } from '../stores/search.store';
import { useNotificationsStore } from '../stores/notifications.store';
import { Search } from 'lucide-react';
import { profileService } from '../services/profile.service';

export const Header = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAgistor, isLoading: isAgistorLoading } = useAgistor();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setUser, clearAuth } = useAuthStore();
  const { setIsSearchModalOpen } = useSearchStore();
  const { 
    notifications, 
    setNotifications, 
    setIsLoading: setIsLoadingNotifications 
  } = useNotificationsStore();

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

  // Add notification fetching
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isSignedIn) return;
      
      setIsLoadingNotifications(true);
      try {
        const response = await profileService.getNotifications();
        setNotifications(response.notifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [isSignedIn, setNotifications, setIsLoadingNotifications]);

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

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
                className="md:hidden p-2 -ml-2 rounded-md hover:bg-gray-100"
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
                className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl font-bold"
              >
                <img src="/AgistMeLogo.svg" alt="Agist Me Logo" className="h-9 w-9 sm:h-10 sm:w-10" />
                <span>Agist Me</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link 
                  to={agistmentsPath}
                  className="text-base sm:text"
                >
                  Agistments
                </Link>
                <Link 
                  to="/listagistment" 
                  className="text-base sm:text"
                >
                  List Agistment
                </Link>
                {showAgistorItems && (
                  <Link 
                    to="/dashboard"
                    className="text-base sm:text"
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <button
                onClick={() => {
                  if (location.pathname === '/agistments') {
                    // Just open the search modal directly
                    setIsSearchModalOpen(true);
                  } else {
                    // Navigate to agistments and set openSearch parameter
                    navigate('/agistments?openSearch=true');
                  }
                }}
                className="p-2 rounded-full hover:bg-neutral-100"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* Avatar with notification indicator */}
              <div className="relative">
                <button
                  onClick={handleAvatarClick}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  {isLoaded ? (
                    isSignedIn ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User avatar'} 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-8 h-8"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )
                  ) : null}
                </button>
                {isSignedIn && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs px-1">
                    {unreadCount}
                  </div>
                )}
              </div>
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
            className="text-base py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/about"
            className="text-base py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to={agistmentsPath}
            className="text-base py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agistments
          </Link>
          <Link 
            to="/listagistment" 
            className="text-base py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            List Agistment
          </Link>
          {showAgistorItems && (
            <Link 
              to="/dashboard"
              className="text-base py-2"
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
