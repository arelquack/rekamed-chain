'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, FileText, Check, X, Search, Clock } from "lucide-react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';

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

const keyMetrics = [
    { title: "Pasien Aktif", value: "78", icon: <Users className="w-5 h-5 text-gray-500" /> },
    { title: "Permintaan Tertunda", value: "4", icon: <Clock className="w-5 h-5 text-gray-500" /> },
    { title: "Rekam Medis Bulan Ini", value: "126", icon: <FileText className="w-5 h-5 text-gray-500" /> },
];

// Ini adalah permintaan yang DIKIRIM oleh dokter saat ini
const sentRequests = [
    { id: 'req1', patientName: 'Budi Santoso', requestedAt: '11 Oktober 2025' },
    { id: 'req2', patientName: 'Citra Lestari', requestedAt: '10 Oktober 2025' },
    { id: 'req3', patientName: 'Dewi Anggraini', requestedAt: '10 Oktober 2025' },
    { id: 'req4', patientName: 'Eko Prasetyo', requestedAt: '9 Oktober 2025' },
];

const activePatients = [
    { id: 'pat1', name: 'Agus Setiawan' },
    { id: 'pat2', name: 'Fajar Nugraha' },
    { id: 'pat3', name: 'Gita Gutawa' },
    { id: 'pat4', name: 'Hesti Purwadinata' },
];

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
            // const fetchRecords = async () => {
            //     setIsLoading(true);
            //     setError('');
            //     try {
            //     const response = await fetch('http://localhost:8080/records', {
            //         headers: { 'Authorization': `Bearer ${token}` },
            //     });

            //     if (!response.ok) {
            //         throw new Error('Gagal mengambil data rekam medis.');
            //     }

            //     const data: MedicalRecord[] = await response.json();
            //     setRecords(data);

            //     } catch (err) {
            //     if (err instanceof Error) {
            //         setError(err.message);
            //     } else {
            //         setError('Terjadi kesalahan yang tidak diketahui.');
            //     }
            //     } finally {
            //     setIsLoading(false);
            //     }
            // };
            
            // fetchRecords();
             setIsLoading(false);
            }
        }
    }, [token, isAuthLoading, router]); 

    if (isAuthLoading || isLoading) {
        return (
        <div className="flex items-center justify-center p-8">
            <p>Loading...</p>
        </div>
        );
    }

   return (
        <ProtectedRoute>
            <div className="p-8 m-0 min-h-screen" style={{ backgroundColor: "#F4F5FA" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    </div>

                    {/* Bagian 1: Statistik Cepat */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {keyMetrics.map((metric) => (
                            <Card key={metric.title}>
                                <CardHeader className="flex flex-row items-center justify-between pb-0">
                                    <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                    {metric.icon}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metric.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Bagian 2: Layout Dua Kolom */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Kolom Kiri: Permintaan Terkirim */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Permintaan Terkirim</CardTitle>
                                    <CardDescription>Melacak status permintaan akses yang telah Anda kirim ke pasien.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {sentRequests.map(req => (
                                            <div key={req.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-semibold">{req.patientName}</p>
                                                    <p className="text-xs text-gray-500">Diminta pada: {req.requestedAt}</p>
                                                </div>
                                                <div className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                                    Menunggu Persetujuan
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kolom Kanan: Pasien Aktif */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pasien Aktif</CardTitle>
                                    <CardDescription>Akses cepat ke pasien yang Anda tangani.</CardDescription>
                                </CardHeader>
                                <CardContent>
                            
                                    <div className="mt-0 space-y-1 max-h-60 overflow-y-auto">
                                        {activePatients.map(patient => (
                                            <Link key={patient.id} href={`/patient/${patient.id}`} passHref>
                                                <div className="p-2 text-sm font-medium rounded-md cursor-pointer hover:bg-accent">
                                                    {patient.name}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}