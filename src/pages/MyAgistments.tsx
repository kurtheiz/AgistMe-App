import { useEffect, useState } from 'react';
import { AgistmentList } from '../components/AgistmentList';
import { AgistmentSearchResponse } from '../types/search';
import { useAuth } from '@clerk/clerk-react';
import { agistmentService } from '../services/agistment.service';

export function MyAgistments() {
  const { userId } = useAuth();
  const [agistments, setAgistments] = useState<AgistmentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        const agistmentsList = response || [];
        setAgistments(agistmentsList.map((agistment: any) => ({
          ...agistment,
          matchType: 'EXACT'
        })));
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
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div>
          {isLoading ? (
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
