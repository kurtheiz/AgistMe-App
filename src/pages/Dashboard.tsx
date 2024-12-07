import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import { AgistmentResponse } from '../types/agistment';
import { List, BarChart, Users } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const [agistments, setAgistments] = useState<AgistmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        setAgistments(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching agistments:', error);
        setAgistments([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthLoaded) {
      fetchAgistments();
    }
  }, [isAuthLoaded]);

  // Redirect if not an agistor
  useEffect(() => {
    if (isAuthLoaded && user && user.publicMetadata?.role !== 'agistor') {
      navigate('/');
    }
  }, [user, isAuthLoaded, navigate]);

  if (loading || !isAuthLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  const stats = {
    totalAgistments: agistments?.length || 0,
    activeAgistments: agistments?.filter(a => !a.visibility?.hidden)?.length || 0,
    totalViews: 0
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              className="bg-white rounded-lg p-6 shadow cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => navigate('/agistments/my')}
            >
              <div className="flex items-center">
                <List className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalAgistments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeAgistments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-secondary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};
