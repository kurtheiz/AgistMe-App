import { ReactNode } from 'react';

interface PageToolbarProps {
  actions?: ReactNode;
}

export const PageToolbar = ({ actions }: PageToolbarProps) => {
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 text-neutral-900">
      <div className="max-w-7xl mx-auto px-2">
        <div className="h-14 flex items-center justify-between">
          {actions}
        </div>
      </div>
    </div>
  );
};
