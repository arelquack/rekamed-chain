// apps/web/src/components/ui/navbar.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

// --- KUMPULAN IKON ---

const LayoutDashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="3" y="15" rx="1" />
        <rect width="7" height="5" x="14" y="11" rx="1" />
    </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);


// --- KOMPONEN UTAMA ---

export function Navbar({ children }: { children: React.ReactNode }) {
    const { token, logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Jika belum login, jangan tampilkan layout sama sekali.
    // Ini akan ditangani oleh ProtectedRoute, tapi sebagai pengaman tambahan.
    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
        { href: '/patients', label: 'Pasien', icon: UsersIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                     <Image src="/icon.png" alt="RekamedChain Logo" width={32} height={32} />
                    <h1 className="text-lg font-bold ml-3">RekamedChain</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                <link.icon className="h-5 w-5 mr-3" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header / App Bar */}
                <header className="h-16 bg-white border-b flex items-center justify-end px-6">
                    <div className="flex items-center">
                        <span className="mr-4 text-sm font-medium">
                            Dr. {user?.name || 'User'}
                        </span>
                        <button 
                            onClick={handleLogout} 
                            className="p-2 rounded-full hover:bg-gray-200"
                            aria-label="Logout"
                        >
                            <LogOutIcon className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}