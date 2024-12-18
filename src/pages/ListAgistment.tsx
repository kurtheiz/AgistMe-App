import { CheckCircle } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { PageToolbar } from '../components/PageToolbar';

const ListAgistment = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { initiateSignIn } = useAuthFlow();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCreateAgistment = async () => {
    if (!isSignedIn) {
      initiateSignIn(window.location.href);
      return;
    }

    try {
      const blankAgistment = await agistmentService.getBlankAgistment();
      navigate(`/agistments/${blankAgistment.id}/edit`, {
        state: { initialAgistment: blankAgistment }
      });
    } catch (error) {
      console.error('Error creating agistment:', error);
      toast.error('Failed to create agistment');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
              </div>
            </div>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            List Your Property on Agist Me
          </h1>
        </div>

        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-900 dark:text-white">
            Required Information for Your Listing
          </h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Minimum Requirements:</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Name</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Location (suburb, state, and region)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>At least one photo of your property</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>At least one paddock type (private, shared, or group paddocks)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>At least one care option (Self Care, Part Care, or Full Care)</span>
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information You Can Add:</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>More Property Photos (up to 5 photos total)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Description</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Size</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Riding Facilities: Arenas (with dimensions), Round Yards (with diameter)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Facilities: Stables, Feed Room, Float Parking, Hot Wash, Tack Room, Tie-Up Areas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Contact Details: Name, Email, Phone Number</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Paddock Details: Available Spaces, Pricing, Availability Dates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Care Options: Self Care, Part Care, Full Care (with pricing and details)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Property Services: Custom Services List</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Social Media Links</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          
          <button 
            onClick={handleCreateAgistment}
            className="btn-primary"
          >
            I am ready, let's go!
          </button>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <stripe-pricing-table 
            pricing-table-id="prctbl_1QWPkDEyHrGCpwOXjYIHiAtB"
            publishable-key="pk_test_51L90MMEyHrGCpwOXqCOvrY2C0MIkd6yFTNjfM6k3mOUoV58j4jNTm2D4NMzbgAbL7fFsLJyOOvlRRFBd9EcChDYy00OXK0rBbC"
          />
        </div>

        
      </div>
    </div>
  );
};

export default ListAgistment;
