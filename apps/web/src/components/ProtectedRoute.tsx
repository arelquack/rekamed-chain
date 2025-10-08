'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika pengecekan sesi dari AuthContext sudah selesai...
    if (!isLoading) {
      // ...dan ternyata tidak ada token (user belum login), arahkan ke halaman login.
      if (!token) {
        router.replace('/login');
      }
    }
  }, [isLoading, token, router]);

  // Selama sesi masih dicek atau jika tidak ada token, tampilkan layar loading.
  // Ini mencegah konten terproteksi "berkedip" sebelum redirect.
  if (isLoading || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  // Jika user sudah login, tampilkan halaman yang diminta.
  return <>{children}</>;
}