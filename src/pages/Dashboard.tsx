import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment, AgistmentResponse, ListingType } from '../types/agistment';
import { ChartBarIcon, ListBulletIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Badge } from '../components/shared/Badge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [agistments, setAgistments] = useState<Agistment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgistments = async () => {
      try {
        const response: AgistmentResponse = await agistmentService.getMyAgistments();
        setAgistments(response.original || []);
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
    activeAgistments: agistments.filter(a => !a.hidden).length,
    totalViews: agistments.reduce((sum, a) => sum + (a.viewCount || 0), 0),
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{agistment.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {agistment.location.suburb}, {agistment.location.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        color={agistment.listingType === ListingType.PROFESSIONAL ? 'emerald' : 'blue'}
                        text={agistment.listingType.toLowerCase()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        color={agistment.hidden ? 'amber' : 'emerald'}
                        text={agistment.hidden ? 'Draft' : 'Published'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {agistment.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agistments/${agistment.id}/edit`);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Edit
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
