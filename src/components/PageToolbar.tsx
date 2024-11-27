import { ReactNode } from 'react';

interface PageToolbarProps {
  actions?: ReactNode;
}

export const PageToolbar = ({ actions }: PageToolbarProps) => {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-t border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          {actions}
        </div>
      </div>
    </div>
  );
};
