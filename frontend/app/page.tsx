'use client';
import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { get } from 'http';

export default function Page() {
  const [subTitle, setSubTitle] = useState<string>(
    'Please sign in to your Intuit account and select your company.'
  );
  const [buttonText, setButtonText] = useState<string>('Intuit Sign-In');

  // Check if user is already signed in.
  getSession().then(session => {
    if (session) {
      // Update the subtitle and button text if user is already signed in.
      setSubTitle(
        'You are already signed in. Click the button below to proceed.'
      );
      setButtonText('Proceed to Home Page');
    }
  });

  const handleQuickBooksSignIn = async () => {
    // Sign in with QuickBooks and catch any errors.
    try {
      // Initiating authentication with QuickBooks provider and set the callback URL.
      await signIn('quickbooks', { callbackUrl: '/home' });
    } catch (error) {
      // Handle any errors, if necessary
      console.error('Error signing in with QuickBooks:', error);
    }
  };

  return (
    <body className="h-screen">
      <div
        id="homePageBody"
        className="flex flex-1 flex-col items-center place-content-center bg-gradient-to-r from-start to-end w-full h-4/5">
        <div
          id="innerContainer"
          className="flex flex-col items-center bg-gray-50 border-4 rounded-lg border-secondary w-11/12 h-fit md:w-2/3 mb-20 px-6 mt-20 md:px-0 md:mb-8 md:mt-0">
          <p className="text-center font-display font-bold text-4xl md:text-5xl mb-16 mt-12 md:mb-12">
            Transaction Classification
          </p>
          <p className="text-center font-display font-bold opacity-80 md:text-xl mb-8">
            {subTitle}
          </p>
          <div
            id="buttonsContainer"
            className="flex justify-evenly w-full mb-8 mt-8 sm:mt-0">
            <button
              id="logIn"
              onClick={handleQuickBooksSignIn}
              className="bloc border-[#000000] border-2 bg-[#E5E5E5] text-lg rounded-md focus:outline-none text-md transition-all duration-300 hover:opacity-80 px-4 py-4">
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </body>
  );
}
