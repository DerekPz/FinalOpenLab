import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface Props {
  children: ReactNode;
}

export default function DefaultLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-white">
      <Navbar />
      <main className="p-4 sm:px-8 lg:px-20">{children}</main>
    </div>
  );
}
