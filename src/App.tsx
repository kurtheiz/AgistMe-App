import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { About } from './components/About';
import { ErrorPage } from './components/ErrorPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import AuthService from './services/auth';
import { Profile } from './components/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useReferenceStore } from './stores/reference.store';
import { referenceService } from './services/reference.service';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// Create router with future flags enabled
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

function AppContent() {
  const { getToken, isLoaded } = useAuth();
  const { setReferenceData } = useReferenceStore();

  // Silent reference data loading
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const token = await getToken({ template: "AgistMe" });
        if (token) {
          AuthService.setAuthToken(token);
        }
        const data = await referenceService.getReferenceData();
        setReferenceData(data);
      } catch {
        /* Silently handle error */
      }
    };

    if (isLoaded) {
      loadReferenceData();
    }
  }, [getToken, isLoaded]); // Dependencies for auth token

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AppContent />
        </ClerkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
