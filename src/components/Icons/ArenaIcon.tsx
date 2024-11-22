import React from 'react';
import { IconProps } from "./types";

export const ArenaIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M36 416h440a20.023 20.023 0 0 0 20-20V116a20.023 20.023 0 0 0-20-20H36a20.023 20.023 0 0 0-20 20v280a20.023 20.023 0 0 0 20 20m12-288h416v256H48Z"/></svg>
  );
};
