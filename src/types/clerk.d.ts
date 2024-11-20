import type { Clerk as ClerkType } from '@clerk/clerk-js';

declare global {
  interface Window {
    Clerk: ClerkType | undefined;
  }
}

export {};
