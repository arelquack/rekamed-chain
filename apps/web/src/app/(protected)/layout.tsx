// apps/web/src/app/(protected)/layout.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar'; // <-- IMPORT Navbar

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika pengecekan sesi selesai dan tidak ada token,
    // paksa kembali ke halaman login.
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  // Selama sesi masih dicek atau jika tidak ada token,
  // tampilkan layar loading untuk mencegah konten "berkedip".
  if (isLoading || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Loading session...</p>
      </div>
    );
  }

  // Jika user sudah login, tampilkan layout Navbar yang membungkus halaman.
  return (
    <Navbar>
      {children}
    </Navbar>
  );
}