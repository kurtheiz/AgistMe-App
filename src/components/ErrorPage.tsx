import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Page Not Found</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Go back home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">{error.status}</h1>
          <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
            {error.statusText}
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {error.data?.message || 'An unexpected error occurred.'}
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">Oops!</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
          Something went wrong
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};
