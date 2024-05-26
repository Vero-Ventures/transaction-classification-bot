import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
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
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
