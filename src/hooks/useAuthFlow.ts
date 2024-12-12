import { useClerk } from '@clerk/clerk-react';

export function useAuthFlow() {
  const { openSignIn } = useClerk();

  const initiateSignIn = (redirectUrl: string = window.location.href) => {
    openSignIn({
      redirectUrl,
      afterSignInUrl: redirectUrl,
      afterSignUpUrl: redirectUrl,
      initialValues: {
        emailAddress: ''
      }
    });
  };

  return { initiateSignIn };
}
