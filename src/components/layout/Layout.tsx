import type { ReactNode } from 'react';
import Header from './Header';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
