import { ReactNode } from 'react';

interface PageToolbarProps {
  actions?: ReactNode;
  children?: ReactNode;
  title?: string;
  mobileActions?: ReactNode;
}

export const PageToolbar = ({ actions, children, title, mobileActions }: PageToolbarProps) => {
  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-neutral-200 text-neutral-900">
      <div className="max-w-7xl mx-auto px-2">
        <div className="h-14 flex items-center justify-between">
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
          
          {/* Show mobileActions in mobile if provided, otherwise show regular actions */}
          <div className="md:hidden">
            {mobileActions || actions}
          </div>

          {/* Desktop view - always show regular actions */}
          <div className="hidden md:block">
            {actions}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
