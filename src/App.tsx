import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ErrorPage } from './components/ErrorPage';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile';
import { ProfileProvider } from './context/ProfileContext';
import { Agistments } from './pages/Agistments';
import { ViewAgistmentDetail } from './pages/ViewAgistmentDetail';
import { Toaster } from 'react-hot-toast';
import { useAuthToken } from './hooks/useAuthToken';
import { ErrorBoundary } from './components/ErrorBoundary';
import ListAgistment from './pages/ListAgistment';
import { CreateAgistment } from './pages/CreateAgistment';
import { Dashboard } from './pages/Dashboard';
import EditAgistmentDetail from './pages/EditAgistmentDetail';

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
      <Route path="/agistments/create" element={<CreateAgistment />} />
      <Route path="/agistments/:id/edit" element={<EditAgistmentDetail />} />
      <Route path="/agistments/:id" element={<ViewAgistmentDetail />} />
      <Route path="/listagistment" element={<ListAgistment />} />
      <Route 
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
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
    <div className="min-h-screen bg-neutral-50">
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AuthInitializer />
            <ProfileProvider>
              <RouterProvider router={router} />
              <Toaster position="top-center" />
            </ProfileProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
