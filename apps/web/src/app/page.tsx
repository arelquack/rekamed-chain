'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa selama sesi masih diperiksa
    if (isLoading) {
      return;
    }

    // Jika pengecekan selesai dan token ada (sudah login), arahkan ke dashboard
    if (token) {
      router.replace('/dashboard');
    } else {
      // Jika tidak ada token (belum login), arahkan ke halaman login
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  // Tampilkan pesan loading sementara logika berjalan
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}