import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="h-16 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AgistMe. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Privacy</Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
