import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      <ErrorBoundary>
        <Header />
        <main className="flex-1 pt-16 h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};
