import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, MessageSquare, Calendar, Fence, Users, DollarSign, ClipboardList } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ListingTypeBadge } from '../components/ListingTypeBadge';
import { useUnreadEnquiriesCount } from '../hooks/useEnquiries';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const unreadCount = useUnreadEnquiriesCount();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not an agistor
  useEffect(() => {
    if (isAuthLoaded && user && user.publicMetadata?.role !== 'agistor') {
      navigate('/');
    }
  }, [user, isAuthLoaded, navigate]);

  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              className="bg-white rounded-lg p-6 shadow hover:bg-neutral-50 transition-colors text-left focus:outline-none"
              onClick={() => navigate('/dashboard/agistments')}
            >
              <div className="flex items-center">
                <List className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">My Agistments</p>
                  <p className="text-sm text-gray-500">Manage your property listings</p>
                </div>
              </div>
            </button>
            
            <button 
              className="bg-white rounded-lg p-6 shadow hover:bg-neutral-50 transition-colors text-left focus:outline-none relative"
              onClick={() => navigate('/dashboard/enquiries')}
            >
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <div className="flex items-center">
                    <p className="text-lg font-medium text-gray-900">Enquiries</p>
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">View and respond to agistment enquiries</p>
                </div>
              </div>
            </button>

            {/* <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="absolute -top-3 left-4">
                <ListingTypeBadge type="professional" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
              <div className="flex items-center opacity-50">
                <ClipboardList className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Waiting List</p>
                  <p className="text-sm text-gray-500">Manage your property waiting list</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="absolute -top-3 left-4">
                <ListingTypeBadge type="professional" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
              <div className="flex items-center opacity-50">
                <Calendar className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Inspections</p>
                  <p className="text-sm text-gray-500">Schedule and manage property inspections</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="absolute -top-3 left-4">
                <ListingTypeBadge type="premium" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
              <div className="flex items-center opacity-50">
                <Fence className="h-8 w-8 text-neutral-400" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Paddocks</p>
                  <p className="text-sm text-gray-500">Manage your paddocks and availability</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="absolute -top-3 left-4">
                <ListingTypeBadge type="premium" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
              <div className="flex items-center opacity-50">
                <Users className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Agistees</p>
                  <p className="text-sm text-gray-500">View and manage your agistees</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="absolute -top-3 left-4">
                <ListingTypeBadge type="premium" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
              <div className="flex items-center opacity-50">
                <DollarSign className="h-8 w-8 text-neutral-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Finances</p>
                  <p className="text-sm text-gray-500">Track payments and manage invoices</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
