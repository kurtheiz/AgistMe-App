import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout = () => {

  // Load reference data
  // useEffect(() => {
  //   const loadReferenceData = async () => {
  //     try {
  //       const data = await referenceService.getReferenceData();
  //       setReferenceData(data);
  //     } catch {
  //       /* Silently handle error */
  //     }
  //   };
  //
  //   loadReferenceData();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};
