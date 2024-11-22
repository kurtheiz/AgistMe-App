import { ReactNode } from 'react';

interface PageToolbarProps {
  actions?: ReactNode;
}

export const PageToolbar = ({ actions }: PageToolbarProps) => {
  return (
    <div className="sticky top-0 z-10 w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          {actions}
        </div>
      </div>
    </div>
  );
};
