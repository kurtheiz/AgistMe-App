import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse } from '../types/agistment';
import { ChartBarIcon, ListBulletIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/shared/Badge';

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
        console.log('Agistments set to:', response.agistments || []);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  const stats = {
    totalAgistments: agistments.length,
    activeAgistments: agistments.filter(a => !a.visibility.hidden).length,
    totalViews: agistments.reduce((sum, a) => sum + (a.views || 0), 0),
  };

  const handleVisibilityToggle = async (agistmentId: string, currentHidden: boolean) => {
    setIsUpdating(prev => ({ ...prev, [agistmentId]: true }));
    try {
      await agistmentService.updateAgistment(agistmentId, {
        visibility: { hidden: !currentHidden }
      });
      
      // Update the local state
      setAgistments(prevAgistments => 
        prevAgistments.map(a => 
          a.id === agistmentId 
            ? { ...a, visibility: { hidden: !currentHidden } }
            : a
        )
      );
      
      // toast.success(`Agistment is now ${!currentHidden ? 'hidden from' : 'visible in'} search results`);
    } catch (error) {
      console.error('Error updating visibility:', error);
      // toast.error('Failed to update visibility');
    } finally {
      setIsUpdating(prev => ({ ...prev, [agistmentId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow">
            <div className="flex items-center">
              <ListBulletIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalAgistments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Listings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeAgistments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-secondary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Listings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Listing Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                {agistments.map((agistment) => (
                  <tr 
                    key={agistment.id}
                    onClick={() => navigate(`/agistments/${agistment.id}/edit`)}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{agistment.basicInfo.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {agistment.propertyLocation.location.suburb}, {agistment.propertyLocation.location.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        color={agistment.listing.listingType === 'PROFESSIONAL' ? 'emerald' : 'blue'}
                        text={agistment.listing.listingType.toLowerCase()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisibilityToggle(agistment.id, agistment.visibility.hidden);
                        }}
                        disabled={isUpdating[agistment.id]}
                        title={agistment.visibility.hidden 
                          ? "Hidden - This agistment will not appear in search results" 
                          : "Visible - This agistment will appear in search results"
                        }
                        className={`
                          px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                          ${agistment.visibility.hidden 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <span className="flex items-center gap-2">
                          {agistment.visibility.hidden ? 'Hidden' : 'Visible'}
                          {isUpdating[agistment.id] && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
                          )}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {agistment.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agistments/${agistment.id}`);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
