import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { About } from './components/About';
import { ErrorPage } from './components/ErrorPage';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './components/Profile';
import BioView from './components/BioView';
import { ProfileProvider } from './context/ProfileContext';
import { Agistments } from './components/Agistments';
import { AgistmentDetail } from './components/AgistmentDetail';
import { Toaster } from 'react-hot-toast';
import { useAuthToken } from './hooks/useAuthToken';
import { ErrorBoundary } from './components/ErrorBoundary'; // Add this line

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/agistments" element={<Agistments />} />
      <Route path="/agistments/search" element={<Agistments />} />
      <Route path="/agistment/:id" element={<AgistmentDetail />} />
      <Route 
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/bio" 
        element={
          <ProtectedRoute>
            <BioView />
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
  const { setAuthToken } = useAuthToken();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Always get a fresh token
        const token = await getToken();
        if (token) {
          // Update both localStorage and OpenAPI configuration
          localStorage.setItem('auth_token', token);
          // Update OpenAPI configuration
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
      }
    };
    
    setupAuth();

    // Set up token refresh interval (every 55 minutes)
    const refreshInterval = setInterval(setupAuth, 55 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [getToken, setAuthToken]);

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
              <Toaster position="top-right" />
            </ProfileProvider>
          </ThemeProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
