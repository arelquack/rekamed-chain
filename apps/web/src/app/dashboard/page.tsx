'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Definisikan tipe data untuk rekam medis, sesuai dengan struct di Go
interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    created_at: string;
}

export default function DashboardPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Ambil role user dari localStorage
        const role = localStorage.getItem('role');
        setUserRole(role || '');

        const fetchRecords = async () => {
        // Ambil token dari localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Anda harus login terlebih dahulu.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/records', {
            headers: {
                // Lampirkan token untuk otentikasi
                'Authorization': `Bearer ${token}`,
            },
            });

            if (!response.ok) {
            throw new Error('Gagal mengambil data rekam medis.');
            }

            const data: MedicalRecord[] = await response.json();
            setRecords(data);

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

        fetchRecords();
    }, []); // Array kosong berarti useEffect ini hanya berjalan sekali saat komponen dimuat

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Dashboard Riwayat Medis</h1>
                    {userRole === 'doctor' && (
                        <Link href="/records/new">
                            <Button>+ Tambah Rekam Medis</Button>
                        </Link>
                    )}
            </div>

            {isLoading && <p>Memuat riwayat medis...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!isLoading && !error && (
            <div className="space-y-4">
                {records.length > 0 ? (
                records.map((record) => (
                    <Card key={record.id}>
                    <CardHeader>
                        <CardTitle>{record.diagnosis}</CardTitle>
                        <CardDescription>
                        Oleh: {record.doctor_name} pada {new Date(record.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{record.notes}</p>
                    </CardContent>
                    </Card>
                ))
                ) : (
                <p>Belum ada riwayat medis.</p>
                )}
            </div>
            )}
        </div>
        </main>
    );
}