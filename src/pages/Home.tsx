import { useNavigate } from 'react-router-dom';
import { SearchModal } from '../components/Search/SearchModal';
import { Search } from 'lucide-react';
import { List } from 'lucide-react';
import { useSearchStore } from '../stores/search.store';

export const Home = () => {
  const navigate = useNavigate();
  const { setIsSearchModalOpen, isSearchModalOpen } = useSearchStore();

  return (
    <div className="flex-1 relative flex flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh] min-h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/am.png)',
          }}
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-12 p-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white text-center max-w-3xl">
            Find the perfect home for your horse
          </h1>
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
              {['Search by location', 'Filter by what you need', 'Direct owner contact', 'Detailed property information', 'Get notifications to stay up to date'].map((item) => (
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
              Showcase your facilities, manage your paddock availability, and connect with qualified horse owners. List your property details and get notified when interested agistees enquire about your property. Already posting on social media? Our AI can help you turn that text into the beginning of a listing in seconds.
            </p>
            <ul className="space-y-3 mb-8">
              {['Easy property listing', 'Facility showcase', 'Availability management', 'Direct communication'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700 min-h-[28px]">
                  <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-2 text-gray-900 font-bold min-h-[28px]">
                <span className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0" />
                Create a Standard listing for FREE!
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
