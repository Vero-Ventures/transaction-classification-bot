import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'TCB',
  description:
    'A project to classify transactions using AI, made by BCIT students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col bg-gray-100 min-h-screen">
        <Navbar />
        <main className="animate-fadeIn">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
