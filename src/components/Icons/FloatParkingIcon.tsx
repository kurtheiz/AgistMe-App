import React from 'react';

interface Props {
  className?: string;
}

export const FloatParkingIcon: React.FC<Props> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      fill="none"
    >
      <path d="M18.5 18.5H24m-5.5 0v-14h-15S.5 9 .5 16.616V18.5H7m11.5 0H12m9 2h3m-17-2a2.5 2.5 0 0 0 5 0m-5 0a2.5 2.5 0 0 1 5 0m-2-11v4m-6 0a24 24 0 0 1 1.172-4H15.5v4z" />
    </svg>
  );
};
