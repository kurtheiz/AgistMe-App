import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { setAuthToken } from '../services/auth';
import { useReferenceStore } from '../stores/reference.store';
import { referenceService } from '../services/reference.service';

export const Layout = () => {
  const { isLoaded, getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const { refreshProfile } = useProfile();
  const { setReferenceData } = useReferenceStore();
  const profileLoadedRef = useRef(false);

  // Handle auth state changes
  useEffect(() => {
    const handleAuthChange = async () => {
      if (!isLoaded || profileLoadedRef.current) return;

      try {
        if (isSignedIn && user) {
          const token = await getToken({ template: "AgistMe" });
          if (token) {
            setAuthToken(token);
            await refreshProfile();
            profileLoadedRef.current = true;
            navigate('/profile');
          }
        } else {
          setAuthToken(null);
          profileLoadedRef.current = false;
        }
      } catch (error) {
        console.error('Error handling auth change:', error);
        setAuthToken(null);
        profileLoadedRef.current = false;
      }
    };

    handleAuthChange();
  }, [isSignedIn, isLoaded]);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const data = await referenceService.getReferenceData();
        setReferenceData(data);
      } catch {
        /* Silently handle error */
      }
    };

    if (isLoaded) {
      loadReferenceData();
    }
  }, [isLoaded, setReferenceData]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen pt-16">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};
