import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, MoreVertical, RotateCw } from 'lucide-react';
import { paymentsService } from '../../services/payments.service';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dates';
import { formatPrice } from '../../utils/prices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Menu } from '@headlessui/react';

export const Billing = () => {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const queryClient = useQueryClient();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async () => {
      try {
        const response = await paymentsService.getSubscriptions();
        return response || [];
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
        toast.error('Failed to load subscription information');
        throw error;
      }
    },
    enabled: !!userId && isAuthLoaded,
  });

  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="back-button"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="back-button-text">Back</span>
              </button>
              <span className="breadcrumb-separator">|</span>
              <div className="breadcrumb-container">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="breadcrumb-link"
                >
                  Dashboard
                </button>
                <span className="breadcrumb-chevron">&gt;</span>
                <span>Billing</span>
              </div>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load subscriptions. Please try again later.</p>
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <button
                          onClick={() => navigate(`/agistments/${subscription.agistmentId}`)}
                          className="text-lg font-medium text-gray-900 truncate max-w-[200px] hover:text-primary-600 text-left"
                        >
                          {subscription.agistmentName || 'Unnamed Agistment'}
                        </button>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                            {subscription.metadata.listing_type?.replace('ListingType.', '')}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : subscription.status === 'trialing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100">
                          <MoreVertical className="h-5 w-5 text-neutral-500" />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => navigate(`/dashboard/billing/subscriptions/${subscription.id}/invoices`)}

                                className={`${
                                  active ? 'bg-neutral-50' : ''
                                } block w-full px-4 py-2 text-left text-sm text-neutral-700`}
                              >
                                View Invoices
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  // TODO: Implement subscription deletion
                                  toast.error('This feature is coming soon');
                                }}
                                className={`${
                                  active ? 'bg-neutral-50' : ''
                                } block w-full px-4 py-2 text-left text-sm text-red-600`}
                              >
                                Delete Subscription
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    </div>
                    
                    <div className="space-y-2 text-sm text-neutral-600">
                      {subscription.status === 'trialing' && (
                        <div className="flex justify-between">
                          <span>Current Cost:</span>
                          <span className="font-medium text-green-600">Free Trial</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span>{formatDate(new Date(subscription.current_period_start_date))}</span>
                      </div>
                      {subscription.status === 'trialing' && (
                        <>
                          <div className="flex justify-between text-blue-600">
                            <span>Trial Ends:</span>
                            <span>
                              {formatDate(new Date(subscription.trial_end_date || (subscription.trial_end ? subscription.trial_end * 1000 : new Date())))}
                              <span className="text-neutral-500 ml-1">
                                (in {subscription.days_until_billing} days)
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Billing Starts:</span>
                            <span>
                              {formatDate(new Date(subscription.billing_starts))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost After Trial:</span>
                            <span className="font-medium">
                              {formatPrice(subscription.price_amount)}/month
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-lg text-neutral-600">No subscriptions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
