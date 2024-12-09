import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, MessageSquare, Calendar, Fence, Users, DollarSign } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();

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
            <div 
              className="bg-white rounded-lg p-6 shadow cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => navigate('/agistments/my')}
            >
              <div className="flex items-center">
                <List className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">My Listings</p>
                  <p className="text-sm text-gray-500">Manage your property listings</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Enquiries</p>
                  <p className="text-sm text-gray-500">View and manage enquiries</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="flex items-center opacity-50">
                <Calendar className="h-8 w-8 text-rose-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Inspections</p>
                  <p className="text-sm text-gray-500">Schedule and manage property inspections</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="flex items-center opacity-50">
                <Fence className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Paddocks</p>
                  <p className="text-sm text-gray-500">Manage your paddocks and availability</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="flex items-center opacity-50">
                <Users className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Agistees</p>
                  <p className="text-sm text-gray-500">View and manage your agistees</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow relative">
              <div className="flex items-center opacity-50">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Finances</p>
                  <p className="text-sm text-gray-500">Track payments and manage invoices</p>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-sm font-medium text-neutral-300">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
