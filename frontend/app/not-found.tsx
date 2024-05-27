import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 mt-60">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
