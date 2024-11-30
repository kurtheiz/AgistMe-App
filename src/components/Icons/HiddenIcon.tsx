import { IconProps } from './types';

export const HiddenIcon = ({ className }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1.2em" 
    height="1.2em" 
    viewBox="0 0 14 14"
    className={className}
  >
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.63 3.624C4.621 2.98 5.771 2.5 7 2.5c2.79 0 5.18 2.475 6.23 3.746c.166.207.258.476.258.754c0 .279-.092.547-.258.754c-.579.7-1.565 1.767-2.8 2.583m-1.93.933c-.482.146-.984.23-1.5.23c-2.79 0-5.18-2.475-6.23-3.746A1.2 1.2 0 0 1 .512 7c0-.278.092-.547.258-.754c.333-.402.8-.926 1.372-1.454"/>
      <path d="M8.414 8.414a2 2 0 0 0-2.828-2.828M13.5 13.5L.5.5"/>
    </g>
  </svg>
);