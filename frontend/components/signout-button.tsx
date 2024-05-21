'use client';
import { getSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const SignOutButton = () => {
  const [buttonClass, setButtonClass] = useState<string>('hidden');
  // Check if the user is signed in.
  getSession().then(session => {
    if (session) {
      setButtonClass(
        'text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded transition-colors duration-150'
      );
    }
  });
  return (
    <button
      className={buttonClass}
      onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
