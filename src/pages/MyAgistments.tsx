import { useEffect, useState } from 'react';
import { AgistmentList } from '../components/AgistmentList';
import { AgistmentSearchResponse } from '../types/search';
import { useAuth } from '@clerk/clerk-react';
import { agistmentService } from '../services/agistment.service';
import { PageToolbar } from '../components/PageToolbar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyAgistments() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="button-toolbar inline-flex items-center gap-2"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Back</span>
            </button>
            <span className="text-lg font-semibold text-neutral-900">My Agistments</span>
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
                matchType="EXACT"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyAgistments;
