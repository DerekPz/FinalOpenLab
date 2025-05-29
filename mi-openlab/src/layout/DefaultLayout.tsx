import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface Props {
  children: ReactNode;
}

export default function DefaultLayout({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-light dark:bg-dark">
      <Navbar />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
