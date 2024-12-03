import { IconProps } from './types';

export const SearchAgistmentIcon = ({ className = '' }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Magnifying Glass */}
      <circle cx="9.5" cy="9.5" r="6.5" />
      <path d="M14.5 14.5L19 19" strokeWidth="2" />
      
      {/* Small House/Stable Inside */}
      <path 
        d="M7 11.5V8.5L9.5 6.5L12 8.5V11.5"
        strokeWidth="1.2"
      />
      <path 
        d="M7.8 11.5V9.5H11.2V11.5"
        strokeWidth="1.2"
      />
      <path 
        d="M9.5 6L6.5 8.5"
        strokeWidth="1.2"
      />
      <path 
        d="M9.5 6L12.5 8.5"
        strokeWidth="1.2"
      />
    </svg>
  );
};
