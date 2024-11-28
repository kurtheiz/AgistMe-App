import { useReferenceStore } from '../stores/reference.store';
import { PlanFeature, NotificationPreferences, PhotosLimit } from '../types/reference';

interface PricingPlansProps {
  showButtons?: boolean;
  onPlanSelect?: (planName: string) => void;
}

export const PricingPlans = ({ showButtons = true, onPlanSelect }: PricingPlansProps) => {
  const { referenceData, isLoading, error } = useReferenceStore();

  console.log('PricingPlans - referenceData:', referenceData);

  if (isLoading) {
    return <div className="flex justify-center items-center">Loading pricing plans...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading pricing plans: {error}</div>;
  }

  if (!referenceData?.pricingPlans || referenceData.pricingPlans.length === 0) {
    console.log('No pricing plans available - referenceData:', referenceData);
    return <div>No pricing plans available</div>;
  }

  const getFeatureDisplayValue = (feature: PlanFeature): { show: boolean; label: string; value: string } => {
    const value = feature.value;
    
    if (typeof value === 'boolean') {
      return {
        show: value,
        label: feature.name,
        value: feature.description
      };
    }
    
    if (typeof value === 'string') {
      return {
        show: true,
        label: feature.name,
        value: value
      };
    }
    
    if (typeof value === 'object') {
      if ('email' in value && 'sms' in value) {
        const notifValue = value as NotificationPreferences;
        if (!notifValue.email && !notifValue.sms) return { show: false, label: '', value: '' };
        const notifications = [];
        if (notifValue.email) notifications.push('Email');
        if (notifValue.sms) notifications.push('SMS');
        return {
          show: true,
          label: feature.name,
          value: `${notifications.join(' & ')} notifications`
        };
      }
      
      if ('included' in value && 'limit' in value) {
        const photoValue = value as PhotosLimit;
        return {
          show: photoValue.included,
          label: feature.name,
          value: `Up to ${photoValue.limit} photos`
        };
      }
    }
    
    return { show: false, label: '', value: '' };
  };

  const renderFeatures = (features: PlanFeature[]) => {
    return features.map((feature) => {
      const displayValue = getFeatureDisplayValue(feature);
      if (!displayValue.show) return null;

      return (
        <li key={feature.key} className="flex items-start">
          <svg
            className="h-6 w-6 text-primary-500 dark:text-primary-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div className="ml-3">
            <span className="text-gray-900 dark:text-white font-medium">{displayValue.label}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{displayValue.value}</p>
          </div>
        </li>
      );
    });
  };

  const formatPrice = (price: number, billingPeriod: string) => {
    if (billingPeriod.toLowerCase() === 'free') {
      return (
        <p className="mt-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
        </p>
      );
    }
    return (
      <p className="mt-4">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">${price}</span>
        <span className="text-gray-500 dark:text-gray-400">/{billingPeriod.toLowerCase()}</span>
      </p>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {referenceData.pricingPlans.map((plan) => (
        <div key={plan.name} className="h-full">
          <div className="h-8 relative">
            {plan.recommended && (
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <span className="inline-block px-3 py-1 text-sm text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30 rounded-full">
                  Popular
                </span>
              </div>
            )}
          </div>
          <div className={`h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-lg border-2 ${
            plan.recommended ? 'border-primary-500' : 'border-transparent'
          }`}>
            <div className="p-6 flex flex-col h-full">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.shortDescription}</p>
                {formatPrice(plan.price, plan.billingPeriod)}
              </div>
              
              <div className="mt-8">
                <ul className="space-y-4">
                  {renderFeatures(plan.features)}
                </ul>
              </div>

              {showButtons && (
                <div className="mt-auto pt-8">
                  <button 
                    onClick={() => onPlanSelect?.(plan.name)}
                    className={`w-full px-4 py-2 rounded-md font-semibold text-white ${
                      plan.recommended
                        ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                        : 'bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600'
                    }`}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
