"use client"
import { signIn } from 'next-auth/react';

export default function Page() {
  const handleQuickBooksSignIn = async () => {
    try {
      // Initiating authentication with QuickBooks provider
      await signIn('quickbooks', {callbackUrl: 'http://localhost:3000/test'});
    } catch (error) {
      // Handle any errors, if necessary
      console.error('Error signing in with QuickBooks:', error);
    }
  };

  return (
    <div>
      <button onClick={handleQuickBooksSignIn}>Sign in with QuickBooks</button>
    </div>
  );
}