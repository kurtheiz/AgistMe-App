import React from 'react';

interface ArrowLeftIconProps {
  className?: string;
}

export const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="0.6em" height="1.2em" viewBox="0 0 12 24"><path fill="currentColor" fill-rule="evenodd" d="m3.343 12l7.071 7.071L9 20.485l-7.778-7.778a1 1 0 0 1 0-1.414L9 3.515l1.414 1.414z"/></svg>
);
