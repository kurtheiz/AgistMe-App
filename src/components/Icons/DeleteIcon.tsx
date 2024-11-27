import { SVGProps } from 'react';

export function DeleteIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M16 9v10H8V9zm-1.5-6h-5l-1 1H5v2h14V4h-3.5zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z"
      />
    </svg>
  );
}
