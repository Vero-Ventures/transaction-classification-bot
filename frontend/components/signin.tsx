'use client';

import { signIn } from 'next-auth/react';

const SignInButton = () => {
  return (
    <button
      className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      onClick={() => signIn('quickbooks', { callbackUrl: '/home' })}>
      Sign in with QuickBooks
    </button>
  );
};

export default SignInButton;
