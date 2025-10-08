'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MedicalRecord {
    id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    attachment_cid: string;
    created_at: string;
}

export default function PatientDetailPage() {
    const params = useParams();
    const patientId = params.patientId as string;

    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // <-- PERBAIKAN 1: State 'message' ditambahkan

    // Fungsi untuk meminta izin akses
    const handleRequestConsent = async (patientIdForRequest: string) => {
        setMessage(`Mengirim permintaan untuk user ${patientIdForRequest}...`);
        const token = localStorage.getItem('token');
        if (!token) {
        setMessage("Error: Token tidak ditemukan.");
        return;
        }

        try {
        const response = await fetch(`http://localhost:8080/consent/request`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ patient_id: patientIdForRequest }),
        });

        if (!response.ok) {
            throw new Error('Gagal mengirim permintaan izin.');
        }
        
        const data = await response.json();
        const successMsg = `Sukses! Permintaan izin berhasil dikirim. ID Permintaan: ${data.request_id}`;
        setMessage(successMsg);
        alert(successMsg);

        } catch (err) {
        if (err instanceof Error) {
            setMessage(err.message);
            alert(`Error: ${err.message}`);
        }
        }
    };

    useEffect(() => {
        if (!patientId) return;

        const fetchPatientRecords = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Login dibutuhkan.');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/records/patient/${patientId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 403) { // 403 Forbidden = Tidak punya izin
            throw new Error('Akses ditolak. Anda tidak memiliki izin untuk melihat data pasien ini.');
            }
            if (!response.ok) {
            throw new Error('Gagal mengambil data pasien.');
            }

            const data = await response.json();
            setRecords(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoading(false);
        }
        };

        fetchPatientRecords();
    }, [patientId]);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Detail Riwayat Pasien</h1>
            <div className="flex gap-2"> {/* Tambah div pembungkus */}
                {/* Tombol Lihat Audit Log */}
                {!isLoading && !error && (
                    <Link href={`/audit-log/${patientId}`}>
                        <Button variant="outline">Lihat Audit Log</Button>
                    </Link>
                )}
                {/* Tombol Tambah Rekam Medis */}
                {!isLoading && !error && (
                    <Link href={`/records/new?patientId=${patientId}`}>
                        <Button>+ Tambah Rekam Medis</Button>
                    </Link>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-4 font-mono">ID: {patientId}</p>

            {isLoading && <p>Memuat data...</p>}
            
            {error && (
            <Card className="bg-red-50 border-red-200">
                <CardHeader>
                <CardTitle className="text-red-800">Akses Ditolak</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-red-700">{error}</p>
                {/* PERBAIKAN 2: Tombol dihubungkan ke fungsinya */}
                <Button className="mt-4" onClick={() => handleRequestConsent(patientId)}>
                    Minta Izin Akses Sekarang
                </Button>
                {message && <p className="text-sm mt-2">{message}</p>}
                </CardContent>
            </Card>
            )}

            {!isLoading && !error && (
            <div className="space-y-4">
                {records.length > 0 ? (
                records.map((record) => (
                    <Card key={record.id}>
                    <CardHeader>
                        <CardTitle>{record.diagnosis}</CardTitle>
                        {/* ... (sisa CardHeader tidak berubah) ... */}
                    </CardHeader>
                    <CardContent>
                        {/* ... (sisa CardContent tidak berubah) ... */}
                    </CardContent>
                    </Card>
                ))
                ) : (
                <p>Pasien ini belum memiliki riwayat medis.</p>
                )}
            </div>
            )}
        </div>
        </div>
    );
}