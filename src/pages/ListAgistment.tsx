import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { PricingPlans } from '../components/PricingPlans';
import { useClerk } from '@clerk/clerk-react';

const ListAgistment = () => {
  const { isSignedIn } = useUser();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { openSignIn } = useClerk();

  const handlePlanSelect = (planName: string) => {
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

  const features = [
    {
      title: 'Paddock Options',
      description: 'List private, shared, or group paddocks with detailed availability and pricing.',
      icon: '🌳'
    },
    {
      title: 'Premium Facilities',
      description: 'Showcase your arenas, round yards, stables, and wash bays.',
      icon: '🏗️'
    },
    {
      title: 'Care Services',
      description: 'Offer full care, part care, or self-care options to suit different needs.',
      icon: '🤝'
    },
    {
      title: 'Additional Amenities',
      description: 'Highlight feed rooms, tack rooms, float parking, and more.',
      icon: '🏠'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            List Your Property on AgistMe
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the perfect plan for your property and start earning today
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature) => (
            <div key={feature.title} className="relative p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <PricingPlans showButtons onPlanSelect={handlePlanSelect} />
        </div>
      </div>
    </div>
  );
};

export default ListAgistment;
