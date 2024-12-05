import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import { PageToolbar } from '../components/PageToolbar';
import { AgistmentList } from '../components/AgistmentList';
import { useProfile } from '../context/ProfileContext';
import { Plus } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { scrollManager } from '../utils/scrollManager';

export function MyAgistments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [agistments, setAgistments] = useState<AgistmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle scroll position
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

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        // Handle the nested agistments structure
        const agistmentsList = response?.agistments || [];
        setAgistments(Array.isArray(agistmentsList) ? agistmentsList : []);
      } catch (error) {
        console.error('Error fetching agistments:', error);
        setError('Failed to load agistments');
        setAgistments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgistments();
  }, []);

  return (
    <>
      <PageToolbar
        actions={
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 py-2 text-neutral-900 dark:text-white"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
            <span className="text-sm sm:text-base text-neutral-900 dark:text-white">My Agistments</span>
          </div>
        }
      />
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="text-center pb-8 md:px-4 pb text-gray-500">
              <AgistmentList 
                agistments={agistments} 
                title="Agistments"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyAgistments;
