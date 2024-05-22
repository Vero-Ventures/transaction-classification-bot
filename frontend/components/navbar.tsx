import SignOutButton from '@/components/signout-button';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

const Navbar = async () => {
  const session = await getServerSession(options);
  return (
    <>
      <nav className="bg-gray-800 py-4 flex justify-between items-center px-6 sticky top-0 z-50">
        <div className="text-white">Transaction Classification Bot</div>
        {session && <SignOutButton />}
      </nav>
    </>
  );
};

export default Navbar;
