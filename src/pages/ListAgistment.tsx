import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { PricingPlans } from '../components/PricingPlans';
import { CheckCircle } from 'lucide-react';
import { useListingTypeStore } from '../stores/listingType.store';

const ListAgistment = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const setSelectedType = useListingTypeStore(state => state.setSelectedType);

  const handlePlanSelect = (planName: string) => {
    const listingType = planName.toUpperCase() as 'PROFESSIONAL' | 'STANDARD';
    setSelectedType(listingType);
    
    if (!isSignedIn) {
      openSignIn({
        redirectUrl: '/agistments/create',
        afterSignInUrl: '/agistments/create',
        afterSignUpUrl: '/agistments/create'
      });
    } else {
      navigate('/agistments/create');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            List Your Property on Agist Me
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Turn your property into a thriving agistment business
          </p>
        </div>

        <div className="mb-16">
          <PricingPlans showButtons onPlanSelect={handlePlanSelect} />
        </div>
        
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-900 dark:text-white">
            Why List Your Property with Agist Me?
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Flexible Listing Options</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Whether you have private paddocks, shared spaces, or group arrangements, our platform lets you customize your listings to match your property's unique offerings. Set your own pricing and availability to maintain complete control over your agistment business.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Showcase Your Facilities</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  From premium arenas and round yards to stables and wash bays, highlight all the facilities that make your property stand out. Quality facilities attract quality clients, and our platform helps you showcase your property's best features.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Flexible Care Options</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Offer the level of service that suits your business model. Whether you provide full-care services, part-care arrangements, or self-care options, you can clearly communicate your offerings to potential clients and set appropriate pricing.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Additional Revenue Streams</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Maximize your property's potential by highlighting additional amenities such as feed storage, tack rooms, and float parking. These extras can set your listing apart and provide opportunities for additional income streams.
                </p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default ListAgistment;
