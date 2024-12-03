import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { PageToolbar } from '../components/PageToolbar';
import PropertyCard from '../components/PropertyCard';
import { useProfile } from '../context/ProfileContext';
import { Star } from 'lucide-react';
import { ArrowLeftIcon } from '../components/Icons';

export function FavoriteAgistments() {
  const navigate = useNavigate();
  const { profile, loading: isProfileLoading } = useProfile();
  const [agistments, setAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!profile) return;
      
      try {
        console.log('Fetching favourites, profile.favourites:', profile.favourites);
        setLoading(true);
        const agistmentsArray = await agistmentService.getFavoriteAgistments();
        console.log('Fetched agistments:', agistmentsArray);
        // Filter agistments to only show current favorites
        const currentFavorites = agistmentsArray.filter(agistment => 
          profile.favourites?.some(fav => fav.agistmentId === agistment.id)
        );
        console.log('Current favorites after filtering:', currentFavorites);
        setAgistments(currentFavorites);
      } catch (error) {
        console.error('Error fetching favourite agistments:', error);
        setError('Failed to fetch favourite agistments');
        setAgistments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [profile?.favourites]); // Re-fetch when favourites array changes

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (!agistments || agistments.length === 0) {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">No Favourites Yet</h2>
          <p className="text-neutral-600 mb-4">You haven't added any agistments to your favourites.</p>
          <button
            onClick={() => navigate('/agistments')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300"
          >
            Browse Agistments
          </button>
        </div>
      );
    }

    return (
      <div className="px-0 sm:px-6">
        <h2 className="text-base font-medium text-neutral-900 dark:text-white mb-4">
          {agistments.length === 1
            ? '1 Favourite Agistment'
            : `${agistments.length} Favourite Agistments`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agistments.map((agistment) => (
            <PropertyCard key={agistment.id} agistment={agistment} onClick={() => navigate(`/agistments/${agistment.id}`)} />
          ))}
        </div>
      </div>
    );
  };

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
                <ArrowLeftIcon className="w-3 h-3" />
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
                    <ArrowLeftIcon className="w-3 h-3" />
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
                  <ArrowLeftIcon className="w-3 h-3" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
                <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
                <span className="text-sm sm:text-base text-neutral-900 dark:text-white">Favourites</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
