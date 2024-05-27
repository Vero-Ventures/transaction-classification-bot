'use client';
import { signOut } from 'next-auth/react';

const SignOutButton = () => {
  return (
    <button
      className="text-white underline underline-offset-2 hover:bg-gray-700 px-4 py-2 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
      onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
