import { SignIn } from '@clerk/clerk-react';

export const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
              footerActionLink: 'text-primary-600 hover:text-primary-700'
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
};
