import { useUser } from '@clerk/clerk-react';

interface AgistorHookResult {
  isAgistor: boolean;
  isLoading: boolean;
}

export const useAgistor = (): AgistorHookResult => {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Return loading state if user is not loaded
  if (!isUserLoaded) {
    return { isAgistor: false, isLoading: true };
  }

  // Return not loading and not agistor if no user
  if (!user) {
    return { isAgistor: false, isLoading: false };
  }

  const isAgistor = user.publicMetadata?.role === 'agistor';
  
  return {
    isAgistor,
    isLoading: false
  };
};
