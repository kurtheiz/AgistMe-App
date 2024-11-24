import React from 'react';

interface CrossIconProps {
  className?: string;
}

export const CrossIcon: React.FC<CrossIconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1.2em" 
      height="1.2em" 
      viewBox="0 0 20 20"
      className={className}
    >
      <path 
        fill="currentColor" 
        d="m12.12 10l3.53 3.53l-2.12 2.12L10 12.12l-3.54 3.54l-2.12-2.12L7.88 10L4.34 6.46l2.12-2.12L10 7.88l3.54-3.53l2.12 2.12z"
      />
    </svg>
  );
};
