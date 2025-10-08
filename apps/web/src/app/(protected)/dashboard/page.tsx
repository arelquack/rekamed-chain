'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Definisikan tipe data untuk rekam medis
interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    attachment_cid: string;
    created_at: string;
}

export default function DashboardPage() {
    const { token, role, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Jika proses pengecekan sesi dari AuthContext sudah selesai...
        if (!isAuthLoading) {
        // ...dan ternyata tidak ada token (user belum login), usir ke halaman login.
        if (!token) {
            router.push('/login');
            return;
        }

        // Jika ada token (user sudah login), baru kita ambil data rekam medisnya.
        if (token) {
            const fetchRecords = async () => {
                setIsLoading(true);
                setError('');
                try {
                const response = await fetch('http://localhost:8080/records', {
                    headers: { 'Authorization': `Bearer ${token}` },
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
            }
        }
    }, [token, isAuthLoading, router]); // Effect ini akan berjalan setiap kali status login berubah

    // Tampilkan loading jika sesi sedang diverifikasi atau data sedang diambil
    if (isAuthLoading || isLoading) {
        return (
        <div className="flex items-center justify-center p-8">
            <p>Loading...</p>
        </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard Riwayat Medis</h1>
                <div className="flex items-center gap-4">
                    <Link href="/consent">
                    <Button variant="outline">Manajemen Izin</Button>
                    </Link>
                    {/* Tampilkan tombol HANYA jika rolenya adalah 'doctor' */}
                    {role === 'doctor' && (
                    <>
                        <Link href="/ledger">
                        <Button variant="outline">Lihat Ledger</Button>
                        </Link>
                        <Link href="/records/new">
                        <Button>+ Tambah Rekam Medis</Button>
                        </Link>
                    </>
                    )}
                </div>
                </div>

                {error && <p className="text-red-600">{error}</p>}

                {!error && (
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
                            {record.attachment_cid && (
                            <div className="mt-4">
                                <a
                                href={`http://localhost:8081/ipfs/${record.attachment_cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                                >
                                Lihat Lampiran
                                </a>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                CID: {record.attachment_cid}
                                </p>
                            </div>
                            )}
                        </CardContent>
                        </Card>
                    ))
                    ) : (
                    <p>Belum ada riwayat medis.</p>
                    )}
                </div>
                )}
            </div>
            </div>
        </ProtectedRoute>
    );
}