import { IconProps } from './types';

export const VisibleIcon = ({ className }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1.2em" 
    height="1.2em" 
    viewBox="0 0 14 14"
    className={className}
  >
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.23 6.246c.166.207.258.476.258.754c0 .279-.092.547-.258.754C12.18 9.025 9.79 11.5 7 11.5S1.82 9.025.77 7.754A1.2 1.2 0 0 1 .512 7c0-.278.092-.547.258-.754C1.82 4.975 4.21 2.5 7 2.5s5.18 2.475 6.23 3.746"/>
      <path d="M7 9a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/>
    </g>
  </svg>
);