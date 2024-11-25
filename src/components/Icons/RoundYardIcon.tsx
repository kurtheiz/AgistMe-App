import React from 'react';
import { IconProps } from "./types";

export const RoundYardIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};
