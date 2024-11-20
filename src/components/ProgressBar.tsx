import { useProgressStore } from '../stores/progress.store';

export const ProgressBar = () => {
  const isLoading = useProgressStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div className="h-1 w-full bg-primary-100 dark:bg-primary-900/20">
        <div
          className="h-1 bg-primary-600 dark:bg-primary-400 transition-all duration-500 ease-in-out"
          style={{
            width: '90%',
            animation: 'progress-bar 2s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes progress-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
