'use client';

import { useState, useEffect } from 'react'; // <-- 1. IMPORT useEffect
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

// --- KUMPULAN IKON ---

// Komponen Ikon Mata untuk tombol lihat password
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// Komponen Ikon Mata Dicoret untuk tombol tutup password
const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const router = useRouter();
    const auth = useAuth(); 

    useEffect(() => {
        if (!auth.isLoading && auth.token) {
            router.push('/dashboard');
        }
    }, [auth.isLoading, auth.token, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });


        if (!response.ok) {
            const errorText = await response.text(); 
            throw new Error(errorText || 'Terjadi kesalahan saat login.');
        }

        const data = await response.json();

        auth.login(data.token, data.role, data.name);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak diketahui.');
            }
            setIsLoading(false);
        }
    };

     if (auth.isLoading || auth.token) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Loading session...</p>
            </div>
        )
    }

    return (
        <main className="flex flex-col min-h-screen items-center justify-center gap-6 p-4" style={{backgroundColor: "#F4F5FA"}}>
            <div className="flex flex-col items-center justify-center gap-0">
                <img src="/icon.png" alt="RekamedChain Icon" className="w-30 h-30" />
                <div className='text-center'>
                    <p className='text-gray-600'>Akses khusus untuk tenaga medis rumah sakit</p>
                </div>
            </div>
            
            <Card className="w-full max-w-md">
                <CardContent className="p-6 pt-2 pb-2">
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5 relative">
                                <Label htmlFor="email">Email</Label>
                                <MailIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
                                <Input
                                    style={{borderRadius: 5, marginTop: "4px"}} 
                                    id="email"
                                    type="email"
                                    className='pl-10'
                                    placeholder="contoh@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5 relative">
                                <Label htmlFor="password">Password</Label>
                                <LockIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
                                <Input
                                    style={{borderRadius: 5, marginTop: "4px"}} 
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className='pl-10'
                                    placeholder="Masukkan password Anda"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-8 text-gray-500"
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6" style={{backgroundColor: isLoading ? "#434f64ff" : "#3A81FF", borderRadius: 5}} disabled={isLoading}>
                            {isLoading ? 'Masuk...' : 'Masuk'}
                        </Button>
                    </form>
                    {error && <p className={`mt-4 text-center text-sm ${error.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>{error}</p>}
                </CardContent>
            </Card>
            <div className='text-center'>
                <p>Belum punya akun? <a href={"/register"} className="font-semibold" style={{color: "#3A81FF"}}>Daftar Sekarang</a></p>
            </div>
        </main>
    );
}