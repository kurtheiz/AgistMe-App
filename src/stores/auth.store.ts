import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          return null;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          return null;
        }
      },
      initializeAuth: async () => {
        const { clearAuth, setLoading } = get();
        try {
          setLoading(true);
          clearAuth();
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
