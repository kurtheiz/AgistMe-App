import { ClerkProvider, useAuth, SignIn } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { About } from './components/About';
import { ErrorPage } from './components/ErrorPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { useReferenceStore } from './stores/reference.store';
import { referenceService } from './services/reference.service';
import { useAuthToken } from './hooks/useAuthToken';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './components/Profile';
import { ProfileProvider } from './context/ProfileContext';
import { setAuthToken, getAuthToken } from './services/auth';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<ErrorPage />} />
    </Route>
  ),
  {
    future: {
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true
    }
  }
);

// Component to handle auth initialization
const AuthInitializer = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Check if we already have a valid token
        const existingToken = getAuthToken();
        if (existingToken) {
          setAuthToken(existingToken);
          return;
        }

        // Only get a fresh token if we don't have one
        const token = await getToken({ template: "AgistMe" });
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
        // AuthService.clearAuth();
      }
    };
    
    setupAuth();
  }, [getToken]);

  return null;
};

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800">
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AuthInitializer />
          <ThemeProvider>
            <ProfileProvider>
              <RouterProvider router={router} />
            </ProfileProvider>
          </ThemeProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
