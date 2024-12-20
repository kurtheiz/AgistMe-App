import { Link } from 'react-router-dom';
import { useAgistor } from '../hooks/useAgistor';

export const Footer = () => {
  const { isAgistor } = useAgistor();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agist Me</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="text-sm">About</Link>
              <Link to="/agistments" className="text-sm">Search Agistments</Link>
              <Link to="/listagistment" className="text-sm">List Agistment</Link>
              {isAgistor && (
                <Link to="/dashboard" className="text-sm">Agistor Dashboard</Link>
              )}
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/faq" className="text-sm">FAQ</Link>
              <Link to="/contact" className="text-sm">Contact Us</Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/privacy" className="text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright - Full Width */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm text-center">
            &copy; {new Date().getFullYear()} Agist Me by heizlogic. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
