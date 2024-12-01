import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { ListBulletIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PropertyCard from '../components/PropertyCard';
import { Pencil as PencilIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Loader2 } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <ListBulletIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Listings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAgistments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Listings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAgistments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-secondary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {agistments.map((agistment) => {
            console.log('Rendering agistment:', agistment);
            return (
              <div key={agistment.id} className="relative">
                <PropertyCard agistment={agistment} />
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[18px] z-20">
                  <div className="flex items-center gap-2 bg-sky-600 rounded-full px-3 py-1.5 shadow-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agistments/${agistment.id}/edit`);
                      }}
                      className="text-white hover:text-sky-100 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-sky-500"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVisibilityToggle(agistment.id, agistment.visibility.hidden);
                      }}
                      className="text-white hover:text-sky-100 transition-colors"
                      disabled={isUpdating[agistment.id]}
                    >
                      {isUpdating[agistment.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : agistment.visibility.hidden ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
