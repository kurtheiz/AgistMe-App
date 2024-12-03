import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import PropertyCard from '../components/PropertyCard';
import { PageToolbar } from '../components/PageToolbar';
import { ArrowLeftIcon } from '../components/Icons';

export const MyAgistments = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [agistments, setAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(response.agistments || []);
      } catch (error) {
        console.error('Error fetching agistments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!profileLoading) {
      fetchAgistments();
    }
  }, [profileLoading]);

  // Redirect if not an agistor
  useEffect(() => {
    if (!profileLoading && profile && !profile.agistor) {
      navigate('/');
    }
  }, [profile, profileLoading, navigate]);

  if (loading || profileLoading) {
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
                  <span className="text-sm sm:text-base text-neutral-900 dark:text-white">My Agistments</span>
                </div>
              </div>
            </div>
          }
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
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
                <span className="text-sm sm:text-base text-neutral-900 dark:text-white">My Agistments</span>
              </div>
            </div>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Agistments</h1>
        
        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {agistments.map((agistment) => (
            <div key={agistment.id}>
              <PropertyCard 
                agistment={agistment}
                onClick={() => navigate(`/agistments/${agistment.id}`)}
              />
            </div>
          ))}
          
          {agistments.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <h2 className="text-2xl font-semibold mb-4">No Agistments Yet</h2>
              <p className="text-neutral-600 mb-4">You haven't created any agistments.</p>
              <button
                onClick={() => navigate('/agistments/create')}
                className="btn-primary"
              >
                Create Agistment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAgistments;
