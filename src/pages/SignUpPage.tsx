import { SignUp } from '@clerk/clerk-react';

export const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
              footerActionLink: 'text-primary-600 hover:text-primary-700'
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/"
        />
      </div>
    </div>
  );
};
