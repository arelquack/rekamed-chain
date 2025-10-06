'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // Ambil fungsi login dari AuthContext

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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Email atau password salah.');
        }

        // Jika login berhasil, panggil fungsi login dari context
        // Fungsi ini akan otomatis menyimpan token, role, dan mengarahkan ke dashboard
        login(data.token, data.role);

        } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Terjadi kesalahan yang tidak diketahui.');
        }
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
        <Card className="w-[350px]">
            <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Masukkan kredensial Anda untuk masuk.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
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
                {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Masuk...' : 'Login'}
                </Button>
            </form>
            </CardContent>
        </Card>
        </main>
    );
}