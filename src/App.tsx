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
import { Invoices } from './pages/dashboard/Invoices';
import { QueryProvider } from './providers/QueryProvider';
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
import { useEffect, useState } from 'react';
import React from 'react'; 
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { InitializationOverlay } from './components/InitializationOverlay';
import { Unsubscribe } from './pages/Unsubscribe';

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
        path: 'unsubscribe',
        element: <Unsubscribe />
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
          },
          {
            path: 'billing',
            children: [
              {
                path: 'subscriptions/:subscriptionId/invoices',
                element: (
                  <ProtectedRoute>
                    <Invoices />
                  </ProtectedRoute>
                )
              }
            ]
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
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Store states
  const { setEnquiries, setIsLoading: setEnquiriesLoading } = useEnquiriesStore();
  const { setSavedSearches, setIsLoading: setSavedSearchesLoading } = useSavedSearchesStore();
  const { setBio, setIsLoading: setBioLoading } = useBioStore();
  const { setFavorites, setIsLoading: setFavoritesLoading } = useFavoritesStore();

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
        })(),

        // Load favorites
        (async () => {
          setFavoritesLoading(true);
          try {
            const response = await profileService.getFavourites();
            setFavorites(Array.isArray(response) ? response : response.favourites);
          } catch (error) {
            console.error('Error loading favorites:', error);
          } finally {
            setFavoritesLoading(false);
          }
        })()
      );

      // Load enquiries only for agistors
      const userRole = user.publicMetadata?.role as string;
      if (userRole === 'agistor') {
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
      Promise.all(loadPromises)
        .catch(error => {
          console.error('Error loading data:', error);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else if (!isLoaded || !isUserLoaded) {
      // Still loading auth or user
      setIsInitializing(true);
    } else {
      // No user logged in
      setIsInitializing(false);
    }
  }, [isLoaded, isUserLoaded, userId, user, setUser, queryClient,
      setSavedSearches, setSavedSearchesLoading, setBio, setBioLoading,
      setEnquiries, setEnquiriesLoading, setFavorites, setFavoritesLoading]);

  if (isInitializing) {
    return <InitializationOverlay />;
  }

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
              <Toaster
                position="top-center"
                gutter={8}
                containerStyle={{
                  top: 20,
                }}
                toastOptions={{
                  duration: 2000,
                  style: {
                    background: '#ffffff',
                    color: '#1e361e',
                    border: '1px solid #e5ede5',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#4a774a',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #e5ede5',
                      backgroundColor: '#f3f6f3',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #fee2e2',
                      backgroundColor: '#fef2f2',
                    },
                  },
                }}
              />
            </ErrorBoundary>
          </div>
        </AuthInitializer>
      </QueryProvider>
    </ClerkProvider>
  );
}

export default App;
