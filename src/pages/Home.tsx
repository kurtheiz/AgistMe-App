import { useNavigate } from 'react-router-dom';
import { SearchModal } from '../components/Search/SearchModal';
import { Search } from 'lucide-react';
import { List } from 'lucide-react';
import { useSearchStore } from '../stores/search.store';
import { agistmentService } from '../services/agistment.service';
import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Popover } from '@headlessui/react';

export const Home = () => {
  const navigate = useNavigate();
  const { setIsSearchModalOpen, isSearchModalOpen } = useSearchStore();
  const [agistmentCount, setAgistmentCount] = useState<number>(0);
  const [isNotifying, setIsNotifying] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchCount = async () => {
      const count = await agistmentService.getAgistmentCount();
      setAgistmentCount(count);
    };
    fetchCount();
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleNotifyClick = async () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    setIsNotifying(true);
    
    try {
      const response = await agistmentService.registerForNotifications(email);
      setEmail(''); // Clear the email after successful subscription
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to register for notifications. Please try again.');
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="flex-1 relative flex flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-[url('https://images.agist.me/assets/am-mobile.png')] md:bg-[url('https://images.agist.me/assets/am.png')]"/>
        <div className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-12 p-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white text-center max-w-3xl">
            Find the perfect home for your horse
          </h1>
        </div>
      </div>

      {/* Launch Announcement */}
      <div className="w-full bg-primary-50 dark:bg-primary-900/10 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-2xl md:text-3xl font-semibold text-primary-700 dark:text-primary-300">
              🎉 We've Just Launched!
            </div>
            <div className="text-lg md:text-xl text-center text-primary-600 dark:text-primary-400">
              Our community is growing with{' '}
              <span className="font-bold text-primary-700 dark:text-primary-300">
                {agistmentCount} propert{agistmentCount === 1 ? 'y' : 'ies'}
              </span>{' '}
              currently listed
            </div>
            <div className="text-base md:text-lg text-center text-primary-600 dark:text-primary-400">
              Join us in building Australia's largest agistment marketplace
            </div>
            <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-md mx-auto">
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all
                    ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNotifyClick}
                  disabled={isNotifying}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-all whitespace-nowrap w-full sm:w-auto"
                >
                  {isNotifying ? 'Subscribing...' : 'Notify Me of New Properties'}
                </button>
                <Popover className="relative">
                  <Popover.Button className="text-gray-500 hover:text-gray-700">
                    <HelpCircle className="h-5 w-5" />
                  </Popover.Button>
                  <Popover.Panel className="absolute z-10 w-72 -right-2 mt-2 transform px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600">
                      You'll receive a daily digest email when new properties are listed.
                    </p>
                  </Popover.Panel>
                </Popover>
              </div>
              {emailError && (
                <p className="text-sm text-red-500 text-center">
                  {emailError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">For Horse Owners</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Finding the perfect home for your horse shouldn't be a wild goose chase. Whether you're seeking private paddocks, shared arrangements, or full-care options, our smart search helps you discover properties that match your needs – from lit arenas and round yards to secure tack rooms and float parking.
            </p>
            <ul className="space-y-3 mb-8">
              {['Search by multiple locations and radius', 'Filter by what you need and set your budget', 'Direct owner contact',  'Save searches', 'Add favourites','Create a bio'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700 min-h-[28px]">
                  <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => {
                  navigate('/agistments');
                  setIsSearchModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white text-lg font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="h-5 w-5" />
                Search Agistments
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">For Property Owners</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Showcase your facilities, manage your paddock availability, and connect with qualified horse owners. List your property details and get notified when interested agistees enquire about your property. Connect with horse owners who are interested in your property and what you offer.
            </p>
            <ul className="space-y-3 mb-8">
              {['List once and update as you need', 'Facility showcase', 'Availability management','Easily create agistments from text'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700 min-h-[28px]">
                  <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-2 text-gray-900 font-bold min-h-[28px]">
                <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                List for FREE until 30 June 2025, then only $4.50/month thereafter
              </li>
              <li className="flex items-center gap-2 text-gray-900 font-bold min-h-[28px]">
                <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                Cancel anytime
              </li>
            </ul>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => navigate('/listagistment')}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white text-lg font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <List className="h-5 w-5" />
                List Agistment
              </button>
            </div>
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={() => navigate('/agistments')}
      />
    </div>
  );
};
