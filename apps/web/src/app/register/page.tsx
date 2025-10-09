'use client'; // <-- Penting! Tandai sebagai Client Component karena kita pakai state & event handler

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IdCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="M6 10h4" />
        <path d="M6 14h4" />
        <path d="m14 10 4 4" />
        <path d="m14 14 4-4" />
    </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const StethoscopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
    </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export default function RegisterPage() {
    // State untuk menyimpan nilai dari setiap input field
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nip, setNip] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [role, setRole] = useState('doctor');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter(); 

    // State untuk menampilkan pesan sukses atau error
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Daftar spesialisasi dokter
    const specializations = [
        "Dokter Umum",
        "Penyakit Dalam",
        "Anak",
        "Bedah Umum",
        "Obstetri dan Ginekologi",
        "Jantung dan Pembuluh Darah",
        "Saraf",
        "THT",
        "Mata",
        "Kulit dan Kelamin",
        "Paru",
        "Ortopedi",
        "Psikiatri",
    ];

    // Fungsi yang akan dijalankan saat form di-submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Mencegah browser me-reload halaman
        
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    nip,
                    phone,
                    specialization,
                    password,
                    role
                }),
            });

            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(errorText || 'Terjadi kesalahan saat registrasi.');
            }

            const data = await response.json();

            setMessage("Pendaftaran berhasil! Anda akan dialihkan ke halaman login.");
      
            // Alihkan ke halaman login setelah 2 detik
            setTimeout(() => {
                router.push("/login");
            }, 2000);

            // Kosongkan form
            setName('');
            setEmail('');
            setNip('');
            setPhone('');
            setSpecialization('');
            setPassword('');

        } catch (error) {
            if (error instanceof Error) {
                // Jika terjadi error jaringan atau dari server
                setMessage(error.message);
            } else {
                // Fallback jika yang di-throw bukan objek Error
                setMessage('Terjadi kesalahan yang tidak diketahui.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-col min-h-screen items-center justify-center gap-6 p-4" style={{backgroundColor: "#F4F5FA"}}>
            <div className="flex flex-col items-center justify-center gap-0">
                <img src="/icon.png" alt="RekamedChain Icon" className="w-30 h-30" />
                <div className='text-center'>
                    {/* <h1 className='text-2xl font-bold'>RekamedChain</h1> */}
                    <p className='text-gray-600'>Registrasi akun tenaga medis untuk mengakses sistem rumah sakit</p>
                </div>
            </div>
            
            <Card className="w-full max-w-md">
                <CardContent className="p-6 pt-2 pb-2">
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5 relative">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <UserIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
                                <Input
                                    style={{borderRadius: 5, marginTop: "4px"}} 
                                    id="name"
                                    className='pl-10'
                                    placeholder="Masukkan nama lengkap Anda"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5 relative">
                                <Label htmlFor="nip">NIP/ID Dokter</Label>
                                <IdCardIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
                                <Input
                                    style={{borderRadius: 5, marginTop: "4px"}} 
                                    id="nip"
                                    className='pl-10'
                                    placeholder="Masukkan NIP atau ID Dokter"
                                    value={nip}
                                    onChange={(e) => setNip(e.target.value)}
                                    required
                                />
                            </div>
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
                                <Label htmlFor="phone">Telepon</Label>
                                <PhoneIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
                                <Input
                                    style={{borderRadius: 5, marginTop: "4px"}} 
                                    id="phone"
                                    type="tel"
                                    className='pl-10'
                                    placeholder="Contoh: 081234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5 relative">
                                <Label htmlFor="specialization">Spesialisasi</Label>
                                <StethoscopeIcon className="absolute left-3 top-8 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    id="specialization"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background pl-10 appearance-none"
                                    style={{borderRadius: 5, marginTop: "4px"}}
                                >
                                    <option value="" disabled>Pilih spesialisasi</option>
                                    {specializations.map((spec) => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
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
                            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                        </Button>
                    </form>
                    {message && <p className={`mt-4 text-center text-sm ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                </CardContent>
            </Card>
            <div className='text-center'>
                <p>Sudah punya akun? <a href={"/login"} className="font-semibold" style={{color: "#3A81FF"}}>Masuk di sini</a></p>
            </div>
        </main>
    );
}
