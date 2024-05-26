'use client';

import { signIn } from 'next-auth/react';

const SignInButton = () => {
  return (
    <button
      onClick={() => signIn('quickbooks', { callbackUrl: '/home' })}
      className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300">
      Sign in with QuickBooks
    </button>
  );
};

export default SignInButton;
