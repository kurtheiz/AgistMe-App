import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string;
  metadata?: {
    role?: string;
    publicMetadata?: Record<string, any>;
    privateMetadata?: Record<string, any>;
    unsafeMetadata?: Record<string, any>;
    [key: string]: any;
  };
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
}

interface AuthState {
  apiToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  setApiToken: (token: string | null) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiToken: null,
      isAuthenticated: false,
      user: null,
      isLoading: true,
      setApiToken: (token) => set({ apiToken: token }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ apiToken: null, user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      refreshToken: async () => {
        try {
          const session = await window.Clerk?.session as Session | null;
          if (!session) {
            get().clearAuth();
            return null;
          }
          const token: string | null = await session.getToken({ template: 'AgistMe' }) || null;
          get().setApiToken(token);
          return token;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          get().clearAuth();
          return null;
        }
      },
      initializeAuth: async () => {
        const { setApiToken, clearAuth, setLoading } = get();
        try {
          const session = await window.Clerk?.session as Session | null;
          if (!session) {
            clearAuth();
            return;
          }
          
          // Listen for session changes
          window.Clerk?.addListener((session: Session | null) => {
            if (!session) {
              clearAuth();
              return;
            }
            // Refresh token when session changes
            session.getToken({ template: 'AgistMe' }).then((token: string | null) => {
              setApiToken(token);
            });
          });

          const token: string | null = await session.getToken({ template: 'AgistMe' }) || null;
          setApiToken(token);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          clearAuth();
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        apiToken: state.apiToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
