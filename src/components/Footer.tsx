import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agist Me</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">About</Link>
              <Link to="/agistments" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Agistments</Link>
              <Link to="/listagistment" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">List Agistment</Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Privacy Policy</Link>
              <Link to="/terms" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Terms of Service</Link>
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
