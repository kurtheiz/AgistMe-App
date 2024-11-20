import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAuthToken } from '../hooks/useAuthToken';
import { useReferenceStore } from '../stores/reference.store';
import { referenceService } from '../services/reference.service';
import { ProgressBar } from './ProgressBar';

export const Layout = () => {
  const { isLoaded } = useAuth();
  const location = useLocation();
  const { setReferenceData } = useReferenceStore();

  // Use the consolidated auth token hook
  useAuthToken();

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

    loadReferenceData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            {!isLoaded ? (
              <ProgressBar />
            ) : (
              <Outlet />
            )}
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  );
};
