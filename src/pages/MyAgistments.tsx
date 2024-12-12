import { useEffect, useState } from 'react';
import AgistmentList from '../components/AgistmentList';
import { AgistmentSearchResponse } from '../types/search';
import { useAuth } from '@clerk/clerk-react';
import { agistmentService } from '../services/agistment.service';
import { PageToolbar } from '../components/PageToolbar';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('myAgistmentsScrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      sessionStorage.removeItem('myAgistmentsScrollPosition');
    } else {
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(response.results || []);
      } catch (error) {
        console.error('Error fetching agistments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAgistments();
    }
  }, [userId]);

  return (
    <>
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
                <span className="text-neutral-300 dark:text-neutral-600 mx-2">|</span>
                <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-neutral-900 dark:text-white whitespace-nowrap">
                  <button
                    onClick={() => navigate('/agistments')}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Agistments
                  </button>
                  <span className="text-neutral-900 dark:text-white shrink-0">&gt;</span>
                  <span>My</span>
                </div>
              </div>
            </div>
          </div>
        }
      />
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="pb-8 pt-4 md:px-4 text-gray-500">
              <AgistmentList 
                agistments={agistments} 
                title={`${agistments.length} Agistment${agistments.length !== 1 ? 's' : ''}`}
                onEdit={(agistment) => {
                  sessionStorage.setItem('myAgistmentsScrollPosition', scrollPosition.toString());
                  navigate(`/agistments/${agistment.id}/edit`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyAgistments;
