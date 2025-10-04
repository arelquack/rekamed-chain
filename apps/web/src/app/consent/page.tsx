'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // <-- Import komponen baru

// Tipe data untuk consent request
interface ConsentRequest {
    id: string;
    doctor_id: string;
    patient_id: string;
    status: 'pending' | 'granted' | 'revoked' | 'denied';
    created_at: string;
    updated_at: string;
}

export default function ConsentPage() {
    const [requests, setRequests] = useState<ConsentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Fungsi untuk mengambil daftar permintaan
    const fetchRequests = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { /* ... error handling ... */ return; }

        try {
        const response = await fetch('http://localhost:8080/consent/requests/me', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal mengambil data permintaan.');
        const data: ConsentRequest[] = await response.json();
        setRequests(data);
        } catch (err) {
        if (err instanceof Error) setError(err.message);
        } finally {
        setIsLoading(false);
        }
    };

    // Panggil fetchRequests saat komponen pertama kali dimuat
    useEffect(() => {
        fetchRequests();
    }, []);

    // Fungsi untuk menyetujui permintaan
    const handleApprove = async (requestId: string) => {
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { /* ... error handling ... */ return; }
        
        try {
        const response = await fetch(`http://localhost:8080/consent/grant/${requestId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal menyetujui permintaan.');
        
        setMessage('Permintaan berhasil disetujui!');
        // Refresh daftar permintaan untuk melihat status baru
        fetchRequests();

        } catch (err) {
        if (err instanceof Error) setMessage(err.message);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Manajemen Izin Akses</h1>
            {message && <p className="text-green-600 mb-4">{message}</p>}

            {isLoading && <p>Memuat daftar permintaan...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!isLoading && !error && (
            <div className="space-y-4">
                {requests.length > 0 ? (
                requests.map((req) => (
                    <Card key={req.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                        <span>Permintaan dari Dokter: {req.doctor_id}</span>
                        <Badge variant={req.status === 'pending' ? 'destructive' : 'default'}>
                            {req.status}
                        </Badge>
                        </CardTitle>
                        <CardDescription>
                        Diminta pada {new Date(req.created_at).toLocaleString('id-ID')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {req.status === 'pending' && (
                        <Button onClick={() => handleApprove(req.id)}>
                            Setujui Akses
                        </Button>
                        )}
                    </CardContent>
                    </Card>
                ))
                ) : (
                <p>Tidak ada permintaan izin akses.</p>
                )}
            </div>
            )}
        </div>
        </main>
    );
}