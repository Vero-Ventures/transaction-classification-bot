import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4 flex justify-between items-center text-white">
        <p>&copy; 2024 Transaction Classification Bot. All rights reserved.</p>
        <div className="flex space-x-4">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy & Terms of Service
          </Link>
          <Link href="https://github.com/Vero-Ventures/transaction-classification-bot">
            <FaGithub className="text-2xl hover:text-gray-400 transition-colors duration-300" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
