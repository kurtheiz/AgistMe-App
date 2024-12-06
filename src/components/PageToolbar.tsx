import { ReactNode } from 'react';

interface PageToolbarProps {
  actions?: ReactNode;
  children?: ReactNode;
  title?: string;
}

export const PageToolbar = ({ actions, children, title }: PageToolbarProps) => {
  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-neutral-200 text-neutral-900">
      <div className="max-w-7xl mx-auto px-2">
        <div className="h-14 flex items-center justify-between">
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
          <div className="flex items-center">
            {actions}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
