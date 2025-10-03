// apps/web/src/app/register/page.tsx

'use client'; // <-- Penting! Tandai sebagai Client Component karena kita pakai state & event handler

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
    // State untuk menyimpan nilai dari setiap input field
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State untuk menampilkan pesan sukses atau error
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Jika server merespon dengan error (misal: email sudah terdaftar)
            throw new Error(data.message || 'Terjadi kesalahan saat registrasi.');
        }

        // Jika registrasi berhasil
        setMessage(`Registrasi berhasil! User ID: ${data.userID}`);
        // Kosongkan form
        setName('');
        setEmail('');
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
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-[350px]">
            <CardHeader>
            <CardTitle>Registrasi Akun</CardTitle>
            <CardDescription>Buat akun baru untuk memulai.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                    id="name"
                    placeholder="Masukkan nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                </Button>
            </form>
            {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
            </CardContent>
        </Card>
        </main>
    );
}