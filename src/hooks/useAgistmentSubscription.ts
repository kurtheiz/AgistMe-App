import { useState } from 'react';
import { paymentsService } from '../services/payments.service';
import { ListingType } from '../types/payment';
import toast from 'react-hot-toast';

interface SubscriptionData {
  id: string;
  customer: string;
  status: string;
  current_period_end_date: string;
  current_period_start_date: string;
  metadata: {
    'Agistment Listing': string;
    listing_type: `ListingType.${ListingType}`;
  };
  trial_end_date: string | null;
  default_payment_method: string | null;
  price_amount: number;
  price_currency: string;
  latest_invoice: string;
  days_until_billing: number;
  billing_starts: string;
  cancel_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

export const useAgistmentSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(false);

  const loadSubscriptionForAgistment = async (subscription_id: string) => {
    if (!subscription_id || loadingSubscriptions) return;

    setLoadingSubscriptions(true);
    try {
      const response = await paymentsService.getSubscription(subscription_id);
      if (response) {
        setSubscriptionData(response);
      }
      return response;
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleCancelSubscription = async (subscription_id: string) => {
    if (!subscription_id) return;
    try {
      const response = await paymentsService.cancelSubscription(subscription_id);
      toast.success('Subscription will be cancelled at the end of the billing period');
      setSubscriptionData(response);
      return response;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleContinueSubscription = async (subscription_id: string) => {
    if (!subscription_id) return;
    try {
      const response = await paymentsService.reactivateSubscription(subscription_id);
      toast.success('Subscription will continue');
      setSubscriptionData(response);
      return response;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    }
  };

  return {
    subscriptionData,
    setSubscriptionData,
    loadingSubscriptions,
    loadSubscriptionForAgistment,
    handleCancelSubscription,
    handleContinueSubscription,
  };
};
