import SignOutButton from '@/components/signout';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

const Navbar = async () => {
  const session = await getServerSession(options);
  return (
    <nav className="bg-gray-900 py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-white">
          <span className="text-green-400">Transaction</span> Classification Bot
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {session && session.user && (
          <>
            <div className="text-white">Welcome, {session.user.name}</div>
            <SignOutButton />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
