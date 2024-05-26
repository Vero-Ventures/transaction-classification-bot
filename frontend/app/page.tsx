import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SignInButton from '@/components/signin';
import Spinner from '@/components/spinner';

export default async function Page() {
  const session = await getServerSession();
  if (session) {
    redirect('/home');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl flex-1 px-4 text-center animate-fadeIn">
        <h1 className="text-5xl font-bold mb-4">
          Transaction Classification Bot
        </h1>
        <p className="mt-3 text-2xl mb-6">
          Use AI to classify your transactions effortlessly.
        </p>
        <SignInButton />
      </main>
      <Spinner />
    </div>
  );
}
