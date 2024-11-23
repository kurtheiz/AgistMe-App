import { SVGProps } from 'react';

export function PhotoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1.2em" 
      height="1.2em" 
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        fill="currentColor" 
        d="M19 5v14H5V5zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-4.86 8.86l-3 3.87L9 13.14L6 17h12z"
      />
    </svg>
  );
}
