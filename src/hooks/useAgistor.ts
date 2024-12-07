import { useUser } from '@clerk/clerk-react';

export const useAgistor = () => {
  const { user, isLoaded } = useUser();
  
  // Return false if not loaded or no user
  if (!isLoaded || !user) {
    console.log('useAgistor: Not loaded or no user', { isLoaded, user: !!user });
    return false;
  }

  console.log('useAgistor: User metadata:', {
    publicMetadata: user.publicMetadata,
    role: user.publicMetadata?.role,
    isAgistor: user.publicMetadata?.role === 'agistor'
  });

  // Check if user has agistor role in public metadata
  return user.publicMetadata?.role === 'agistor';
};
