import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SignInButton from '@/components/signin';

export default async function Page() {
  const session = await getServerSession();
  if (session) {
    redirect('/home');
  }
  return (
    <div className="flex flex-col items-center justify-center py-2 mt-40">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl flex-1 px-4 text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Transaction Classification Bot
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Use AI to classify your transactions effortlessly.
        </p>
        <SignInButton />
      </main>
    </div>
  );
}
