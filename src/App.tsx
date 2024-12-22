import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import Agistments from './pages/Agistments';
import { ViewAgistmentDetail } from './pages/agistments/ViewAgistmentDetail';
import ListAgistment from './pages/ListAgistment';
import Profile from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { MyAgistments } from './pages/dashboard/MyAgistments';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorPage } from './components/ErrorPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import { useAuthStore } from './stores/auth.store';
import { useFavoritesStore } from './stores/favorites.store';
import { useSavedSearchesStore } from './stores/savedSearches.store';
import { useBioStore } from './stores/bio.store';
import { useEnquiriesStore } from './stores/enquiries.store';
import { profileService } from './services/profile.service';
import { enquiriesService } from './services/enquiries.service';
import EnquiriesPage from './pages/dashboard/Enquiries';
import PreviewAgistmentDetail from './pages/dashboard/PreviewAgistmentDetail';
import { useEffect } from 'react';
import React from 'react'; // Added React import
import { useQueryClient } from '@tanstack/react-query';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'privacy',
        element: <Privacy />
      },
      {
        path: 'terms',
        element: <Terms />
      },
      {
        path: 'faq',
        element: <FAQ />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'listagistment',
        element: <ListAgistment />
      },
      {
        path: 'agistments',
        children: [
          {
            index: true,
            element: <Agistments />
          },
          {
            path: ':id',
            element: <ViewAgistmentDetail />
          }
        ]
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireAgistor={true}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'agistments',
            children: [
              {
                index: true,
                element: <MyAgistments />
              },
              {
                path: ':id',
                element: <PreviewAgistmentDetail />
              }
            ]
          },
          {
            path: 'enquiries',
            element: (
              <ProtectedRoute>
                <EnquiriesPage />
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <ErrorPage />
      }
    ]
  }
], {
  basename: '/',
  future: {
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true
  }
});

// Component to handle auth initialization
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  
  // Store states
  const { setEnquiries, setIsLoading: setEnquiriesLoading } = useEnquiriesStore();
  const { savedSearches, setSavedSearches, setIsLoading: setSavedSearchesLoading } = useSavedSearchesStore();
  const { bio, setBio, setIsLoading: setBioLoading } = useBioStore();

  useEffect(() => {
    // Only proceed if both auth and user data are loaded and we have a userId
    if (isLoaded && isUserLoaded && userId && user) {
      setUser({
        id: userId,
        email: user?.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        imageUrl: user.imageUrl,
        role: user.publicMetadata?.role as string,
        metadata: {
          ...user.publicMetadata,
          publicMetadata: user.publicMetadata,
          unsafeMetadata: user.unsafeMetadata,
        },
      });

      // Create a promise array to load all data in parallel
      const loadPromises: Promise<void>[] = [];

      // Load initial data
      loadPromises.push(
        // Load saved searches
        (async () => {
          setSavedSearchesLoading(true);
          try {
            const response = await profileService.getSavedSearches();
            setSavedSearches(response.savedSearches);
          } catch (error) {
            console.error('Error loading saved searches:', error);
          } finally {
            setSavedSearchesLoading(false);
          }
        })(),

        // Load bio
        (async () => {
          setBioLoading(true);
          try {
            const response = await profileService.getProfile();
            setBio(response);
          } catch (error) {
            console.error('Error loading bio:', error);
          } finally {
            setBioLoading(false);
          }
        })()
      );

      // Load enquiries only for agistors
      if (user.publicMetadata?.role === 'agistor') {
        setEnquiriesLoading(true);
        loadPromises.push(
          enquiriesService.getEnquiries()
            .then(response => {
              setEnquiries(response.enquiries);
              queryClient.setQueryData(['enquiries'], response);
            })
            .catch(error => {
              console.error('Error loading enquiries:', error);
            })
            .finally(() => {
              setEnquiriesLoading(false);
            })
        );
      }

      // Wait for all data to load
      Promise.all(loadPromises).catch(error => {
        console.error('Error loading data:', error);
      });
    }
  }, [isLoaded, isUserLoaded, userId, user, setUser, queryClient,
      setSavedSearches, setSavedSearchesLoading, setBio, setBioLoading,
      setEnquiries, setEnquiriesLoading]);

  return <>{children}</>;
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryProvider>
        <AuthInitializer>
          <div className="min-h-screen bg-neutral-50">
            <ErrorBoundary>
              <RouterProvider router={router} />
              {/* <Toaster position="top-center" /> */}
            </ErrorBoundary>
          </div>
        </AuthInitializer>
      </QueryProvider>
    </ClerkProvider>
  );
}

export default App;
