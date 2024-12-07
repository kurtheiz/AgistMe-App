import { Navigate, useLocation } from 'react-router-dom';
import { ProgressBar } from './ProgressBar';
import { useAuthToken } from '../hooks/useAuthToken';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAgistor?: boolean;
}

export const ProtectedRoute = ({ children, requireAgistor = false }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn, role } = useAuthToken();
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

  // If route requires agistor role and user is not an agistor, redirect to home
  if (requireAgistor && role !== 'agistor') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
