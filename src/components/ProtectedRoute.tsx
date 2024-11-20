import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ProgressBar } from './ProgressBar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show progress bar while checking authentication
  if (!isLoaded) {
    return <ProgressBar />;
  }

  // Only redirect if we're sure the user isn't signed in
  if (isLoaded && !isSignedIn) {
    // Save the attempted location
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
