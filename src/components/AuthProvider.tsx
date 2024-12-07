import { useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoaded, isSignedIn } = useSession();
  const { setApiToken, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    const updateToken = async () => {
      try {
        if (!isSignedIn || !session) {
          clearAuth();
          return;
        }

        const token = await session.getToken({ template: 'AgistMe' });
        setApiToken(token || null);
      } catch (error) {
        console.error('Failed to get token:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    updateToken();
  }, [isLoaded, isSignedIn, session, setApiToken, clearAuth, setLoading]);

  return <>{children}</>;
}
