import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { List, BarChart, Users, Pencil, Eye, EyeOff, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [agistments, setAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response = await agistmentService.getMyAgistments();
        console.log('Dashboard received response:', response);
        
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  const stats = {
    totalAgistments: agistments.length,
    activeAgistments: agistments.filter(a => !a.visibility.hidden).length,
    totalViews: agistments.reduce((sum, a) => sum + (a.views || 0), 0),
  };

  const handleVisibilityToggle = async (agistmentId: string, currentHidden: boolean) => {
    try {
      setIsUpdating(prev => ({ ...prev, [agistmentId]: true }));
      
      // Find the current agistment
      const currentAgistment = agistments.find(a => a.id === agistmentId);
      if (!currentAgistment) return;

      // Update the entire agistment with new visibility
      const updatedAgistment = {
        ...currentAgistment,
        visibility: { hidden: !currentHidden }
      };
      
      await agistmentService.updateAgistment(agistmentId, updatedAgistment);

      // Update the local state
      setAgistments(prev => 
        prev.map(agistment => 
          agistment.id === agistmentId 
            ? updatedAgistment
            : agistment
        )
      );
    } catch (error) {
      console.error('Error updating visibility:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [agistmentId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow">
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

        {/* Property Cards Grid */}
        <div className="sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {agistments.map((agistment) => {
              console.log('Rendering agistment:', agistment);
              return (
                <div key={agistment.id} className="relative">
                  <PropertyCard 
                    agistment={agistment}
                    onEdit={() => navigate(`/agistments/${agistment.id}/edit`)}
                    onToggleVisibility={() => handleVisibilityToggle(agistment.id, agistment.visibility.hidden)}
                    isUpdatingVisibility={isUpdating[agistment.id]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
