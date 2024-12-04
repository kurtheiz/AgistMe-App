import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import { PageToolbar } from '../components/PageToolbar';
import { ArrowLeft } from 'lucide-react';
import { AgistmentList } from '../components/AgistmentList';

export const MyAgistments = () => {
  const navigate = useNavigate();
  const [agistments, setAgistments] = useState<AgistmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(response);
      } catch (error) {
        console.error('Error fetching agistments:', error);
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
