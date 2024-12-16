import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ErrorPage } from './components/ErrorPage';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Agistments from './pages/Agistments';
import { ViewAgistmentDetail } from './pages/agistments/ViewAgistmentDetail';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import ListAgistment from './pages/ListAgistment';
import { Dashboard } from './pages/Dashboard';
import { MyAgistments } from './pages/dashboard/MyAgistments';
import { useAuthStore } from './stores/auth.store';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import { QueryProvider } from './providers/QueryProvider';
import { useNotificationsStore } from './stores/notifications.store';
import { useFavoritesStore } from './stores/favorites.store';
import { useSavedSearchesStore } from './stores/savedSearches.store';
import { useBioStore } from './stores/bio.store';
import { profileService } from './services/profile.service'; 
import EnquiriesPage from './pages/dashboard/Enquiries';
import PreviewAgistmentDetail from './pages/dashboard/PreviewAgistmentDetail';

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
  const setUser = useAuthStore((state) => state.setUser);
  
  // Notifications state
  const { notifications, setNotifications, setIsLoading: setNotificationsLoading } = useNotificationsStore();
  
  // Favorites state
  const { favorites, setFavorites, setIsLoading: setFavoritesLoading } = useFavoritesStore();
  
  // Saved searches state
  const { savedSearches, setSavedSearches, setIsLoading: setSavedSearchesLoading } = useSavedSearchesStore();
  
  // Bio state
  const { bio, setBio, setIsLoading: setBioLoading } = useBioStore();

  useEffect(() => {
    if (isLoaded && userId) {
      setUser({
        id: userId,
        email: ''  // We'll set this as empty since we don't have it at this point
      });
      
      // Load notifications if not in state
      if (!notifications?.length) {
        setNotificationsLoading(true);
        profileService.getNotifications()
          .then(response => {
            setNotifications(response.notifications);
          })
          .catch(error => {
            console.error('Error loading notifications:', error);
          })
          .finally(() => {
            setNotificationsLoading(false);
          });
      }
      
      // Load favorites if not in state
      if (!favorites?.length) {
        setFavoritesLoading(true);
        profileService.getFavourites({ d: true })
          .then(response => {
            setFavorites(Array.isArray(response) ? response : response.favourites);
          })
          .catch(error => {
            console.error('Error loading favorites:', error);
          })
          .finally(() => {
            setFavoritesLoading(false);
          });
      }
      
      // Load saved searches if not in state
      if (!savedSearches?.length) {
        setSavedSearchesLoading(true);
        profileService.getSavedSearches()
          .then(response => {
            setSavedSearches(response.savedSearches);
          })
          .catch(error => {
            console.error('Error loading saved searches:', error);
          })
          .finally(() => {
            setSavedSearchesLoading(false);
          });
      }
      
      // Load bio if not in state
      if (!bio) {
        setBioLoading(true);
        profileService.getProfile()
          .then(response => {
            setBio(response);
          })
          .catch(error => {
            console.error('Error loading bio:', error);
          })
          .finally(() => {
            setBioLoading(false);
          });
      }
    }
  }, [isLoaded, userId]);

  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPubKey}>
          <QueryProvider>
            <AuthInitializer>
              <RouterProvider router={router} />
              <Toaster position="top-center" />
            </AuthInitializer>
          </QueryProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
