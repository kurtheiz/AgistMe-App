import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { PageToolbar } from '../components/PageToolbar';
import PropertyCard from '../components/PropertyCard';
import { useProfile } from '../context/ProfileContext';
import { Star } from 'lucide-react';

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
        console.log('Fetching favorites, profile.favourites:', profile.favourites);
        setLoading(true);
        const agistmentsArray = await agistmentService.getFavoriteAgistments();
        console.log('Fetched agistments:', agistmentsArray);
        setAgistments(agistmentsArray);
      } catch (error) {
        console.error('Error fetching favorite agistments:', error);
        setError('Failed to fetch favorite agistments');
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
          <h2 className="text-2xl font-semibold mb-4">No Favorites Yet</h2>
          <p className="text-neutral-600 mb-4">
            You haven't added any properties to your favorites yet.
          </p>
          <button
            onClick={() => navigate('/agistments')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300"
          >
            Browse Properties
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {agistments.map((agistment) => (
          <PropertyCard key={agistment.id} agistment={agistment} />
        ))}
      </div>
    );
  };

  // Show loading state while profile is loading
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageToolbar title="My Favorites">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-6 h-6" />
              My Favorites
            </h1>
          </div>
        </PageToolbar>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageToolbar title="My Favorites">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-6 h-6" />
              My Favorites
            </h1>
          </div>
        </PageToolbar>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
            <p className="text-neutral-600 mb-4">You need to be logged in to view your favorites.</p>
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
      <PageToolbar title="My Favorites">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-6 h-6" />
            My Favorites
          </h1>
        </div>
      </PageToolbar>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
