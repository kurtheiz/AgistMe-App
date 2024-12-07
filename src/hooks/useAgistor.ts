import { useAuthToken } from './useAuthToken';

export const useAgistor = () => {
  const { role, isLoaded, isSignedIn } = useAuthToken();
  
  // Return false if not loaded or not signed in
  if (!isLoaded || !isSignedIn) {
    return false;
  }

  // Check if user has agistor role
  return role === 'agistor';
};
