'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    // Jangan tampilkan Navbar di halaman login & register
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const handleLogout = () => {
        // Hapus data sesi dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        // Arahkan ke halaman login
        router.push('/login');
    };

    return (
        <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold text-gray-800">
                RekamedChain
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
                </Link>
                <Button onClick={handleLogout} variant="destructive">
                Logout
                </Button>
            </div>
            </div>
        </div>
        </nav>
    );
}