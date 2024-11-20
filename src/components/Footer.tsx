import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} Agist Me by heizlogic. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Privacy Policy</Link>
            <Link to="/terms" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
