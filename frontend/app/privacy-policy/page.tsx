import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="py-12 px-6 text-left ml-40 w-1/2 text-wrap">
      <h1 className="text-6xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-2xl mb-8">
        You thought you had privacy? Let's set the record straight. We collect
        your transaction history, name, and email, bundle it all up, and sell it
        to the highest bidder. Yes, even those midnight snack purchases and
        those surprise gifts you bought. In this digital age, privacy is just an
        illusion we all like to believe in. Thank you for your trust and
        understanding!
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        Go Back Home
      </Link>
    </div>
  );
}
