import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import { PageToolbar } from '../components/PageToolbar';
import { AgistmentList } from '../components/AgistmentList';
import { useProfile } from '../context/ProfileContext';
import { ArrowLeft } from 'lucide-react';
import { scrollManager } from '../utils/scrollManager';

export function FavoriteAgistments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: isProfileLoading } = useProfile();
  const [agistments, setAgistments] = useState<AgistmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await agistmentService.getFavoriteAgistments();
        const agistmentsList = response?.agistments || [];
        
        // Filter agistments to only show current favorites
        const validAgistments = Array.isArray(agistmentsList) ? agistmentsList.filter((agistment: AgistmentResponse) => 
          agistment && 
          agistment.status !== 'DELETED' && 
          profile.favourites?.some(fav => fav.agistmentId === agistment.id)
        ) : [];
        
        if (validAgistments.length === 0 && profile.favourites && profile.favourites.length > 0) {
          console.log('Attempting to fetch favourites individually...');
          const individualAgistments = await Promise.all(
            profile.favourites.map(async (fav) => {
              try {
                const agistment = await agistmentService.getAgistment(fav.agistmentId);
                return agistment;
              } catch (error) {
                console.error(`Failed to fetch agistment ${fav.agistmentId}:`, error);
                return null;
              }
            })
          );
          const filteredAgistments = individualAgistments.filter((a): a is AgistmentResponse => a !== null);
          setAgistments(filteredAgistments);
        } else {
          setAgistments(validAgistments);
        }
      } catch (error) {
        console.error('Error fetching favorite agistments:', error);
        setError('Failed to load favorite agistments');
        setAgistments([]);
      } finally {
        setLoading(false);
      }
    };

    if (!isProfileLoading) {
      fetchFavorites();
    }
  }, [profile?.favourites, isProfileLoading, profile]);

  useEffect(() => {
    const handleScroll = () => {
      // Only save position if we're not in a loading state
      if (location.key && !loading) {
        scrollManager.savePosition(location.key);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key, loading]);

  // Restore scroll position after content loads
  useEffect(() => {
    // Function to handle scroll restoration
    const restoreScroll = () => {
      if (!loading && agistments.length > 0) {
        if (location.key) {
          const savedPosition = scrollManager.getPosition(location.key);
          if (savedPosition !== undefined) {
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => {
              window.scrollTo(0, savedPosition);
            }, 0);
            return;
          }
        }
        // If no saved position or no location key, scroll to top
        window.scrollTo(0, 0);
      }
    };

    restoreScroll();
  }, [location.key, loading, agistments.length]);

  // Show loading state while profile is loading
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageToolbar
          actions={
            <>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
              <span className="text-sm sm:text-base text-neutral-900 dark:text-white">Favourites</span>
            </>
          }
        />
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageToolbar
          actions={
            <div className="w-full">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="font-medium text-sm sm:text-base">Back</span>
                  </button>
                  <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
                  <span className="text-sm sm:text-base text-neutral-900 dark:text-white">Favourites</span>
                </div>
              </div>
            </div>
          }
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
            <p className="text-neutral-600 mb-4">You need to be logged in to view your favourites.</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageToolbar
        actions={
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
            <span className="text-sm sm:text-base text-neutral-900 dark:text-white">Favourite Agistments</span>
          </div>
        }
      />
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="text-center pb-8 md:px-4 text-gray-500">
              <AgistmentList 
                agistments={agistments} 
                title="Favourite Agistments"
                showCount={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
