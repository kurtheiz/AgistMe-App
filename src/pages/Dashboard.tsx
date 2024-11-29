import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { agistmentService } from '../services/agistment.service';
import { Agistment } from '../types/agistment';
import { Badge } from '../components/shared/Badge';
import { ListBulletIcon, ChartBarIcon, UserGroupIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { EditIcon, VisibleIcon, HiddenIcon } from '../components/Icons';
import { Disclosure } from '@headlessui/react';
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

        {/* Listings List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Listings</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {agistments.map((agistment) => (
              <Disclosure key={agistment.id}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700">
                      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-8 w-full">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agistments/${agistment.id}/edit`);
                            }}
                            className="min-w-[44px] min-h-[44px] p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center"
                          >
                            <EditIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                          </button>
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
                              min-w-[44px] min-h-[44px] p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors
                              flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            {agistment.visibility.hidden ? (
                              <HiddenIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                            ) : (
                              <VisibleIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                            )}
                            {isUpdating[agistment.id] && (
                              <div className="absolute animate-spin rounded-full h-5 w-5 border-2 border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                            )}
                          </button>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{agistment.basicInfo.name}</div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {agistment.propertyLocation.location.suburb}, {agistment.propertyLocation.location.state}
                        </div>
                        <Badge
                          color={agistment.listing.listingType === 'PROFESSIONAL' ? 'emerald' : 'blue'}
                          text={agistment.listing.listingType.toLowerCase()}
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {agistment.views || 0} views
                        </div>
                        <div className="flex items-center">
                          {open ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-6 py-4 bg-gray-50 dark:bg-neutral-900">
                      <div className="max-w-2xl mx-auto">
                        <PropertyCard agistment={agistment} />
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
