'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika proses pengecekan sesi sudah selesai...
    if (!isLoading) {
      // ...dan ternyata tidak ada token (user belum login), usir ke halaman login.
      if (!token) {
        router.replace('/login');
      }
    }
  }, [isLoading, token, router]);

  // Jika sesi masih dicek atau user belum login, tampilkan layar loading
  if (isLoading || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  // Jika user sudah login, izinkan masuk dan tampilkan halamannya
  return <>{children}</>;
}