import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ErrorPage } from './components/ErrorPage';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Agistments from './pages/Agistments';
import { ViewAgistmentDetail } from './pages/ViewAgistmentDetail';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import ListAgistment from './pages/ListAgistment';
import { CreateAgistment } from './pages/CreateAgistment';
import { Dashboard } from './pages/Dashboard';
import EditAgistmentDetail from './pages/EditAgistmentDetail';
import { FavoriteAgistments } from './pages/FavoriteAgistments';
import { MyAgistments } from './pages/MyAgistments';
import { useAuthStore } from './stores/auth.store';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/listagistment" element={<ListAgistment />} />
      <Route path="agistments">
        <Route index element={<Agistments />} />
        <Route 
          path="create" 
          element={<CreateAgistment />}
        />
        <Route 
          path=":id/edit" 
          element={
            <ProtectedRoute requireAgistor={true}>
              <EditAgistmentDetail />
            </ProtectedRoute>
          } 
        />
        <Route path=":id" element={<ViewAgistmentDetail />} />
        <Route 
          path="favourites" 
          element={
            <ProtectedRoute>
              <FavoriteAgistments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my" 
          element={
            <ProtectedRoute requireAgistor={true}>
              <MyAgistments />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route 
        path="/dashboard"
        element={
          <ProtectedRoute requireAgistor={true}>
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
    basename: '/',
    future: {
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true
    }
  }
);

// Component to handle auth initialization
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { isLoading, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isClerkLoaded) return;
      
      await initializeAuth();
      setIsInitialized(true);
    };

    init();
  }, [isClerkLoaded, isSignedIn, initializeAuth]);

  if (!isInitialized || isLoading || !isClerkLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AuthInitializer>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
          </AuthInitializer>
        </ClerkProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
