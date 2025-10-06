'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const { token, logout } = useAuth(); 

    // Jangan tampilkan Navbar di halaman login & register
    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
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
                <Link href="/patients" className="text-gray-600 hover:text-gray-900">
                    Pasien
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