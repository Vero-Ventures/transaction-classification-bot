'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';


export default function CompleteProfilePage() {
  const router = useRouter();


  const [industry, setIndustry] = useState('');
  const [receiveEmails, setReceiveEmails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await getSession();
    console.log('Check Session:' + JSON.stringify(session));
    console.log('Submitting form');
    if (!session?.user?.email) {
      console.error('No email found in session'); 
      return;
    }

    const response = await fetch('/api/complete-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        industry,
        receiveEmails,
      }),
    });
    console.log(response);

    if (response.ok) {
      // Redirect to the home page or any other page after successful completion
      router.push('/');
    } else {
      // Handle the error
      console.error('Failed to update profile');
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={receiveEmails}
              onChange={(e) => setReceiveEmails(e.target.checked)}
              className="mr-2 leading-tight"
            />
            I agree to receive emails
          </label>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
