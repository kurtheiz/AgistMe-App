import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-lg">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Welcome to AgistMe
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-300 max-w-2xl text-center">
        Your modern solution for managing and organizing information.
      </p>
      <div className="flex gap-4">
        <Link
          to="/about"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Learn More
        </Link>
        <a
          href="https://github.com/yourusername/AgistMe-App"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};
