'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  formatted_id: string;
}

// Komponen Ikon Kalender
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

// Komponen Ikon Jam
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

// Komponen MailIcon yang sudah Anda buat
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

// ✅ Buat komponen PhoneIcon
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11 2.34a.73.73 0 0 0-1.06 0L8.23 4.02a.73.73 0 0 0 0 1.06l1.06 1.06" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72a.73.73 0 0 0 1.06 0l1.77-1.77a.73.73 0 0 0 0-1.06l-1.06-1.06" />
    </svg>
);

export default function PatientDetailPage() {
    const params = useParams();
    const patientId = params.patientId as string;

    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
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

                if (response.status === 403) {
                throw new Error('Akses ditolak. Anda tidak memiliki izin untuk melihat data pasien ini.');
                }
                if (!response.ok) {
                throw new Error('Gagal mengambil data pasien.');
                }

                const data = await response.json();
                setRecords(data);

                const userResponse = await fetch(`http://localhost:8080/users/detail/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!userResponse.ok) {
                throw new Error('Gagal mengambil profil pasien.');
                }

                const userData = await userResponse.json();
                setUser(userData);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientRecords();
    }, [patientId]);

    const getInitials = (name: string) => {
        if (!name) return '?';
        const words = name.split(' ');
        const initials = words[0][0] + (words.length > 1 ? words[1][0] : '');
        return initials.toUpperCase();
    };

    return (
        <div className="p-8 m-0" style={{backgroundColor: "#F4F5FA", height: "100%"}}>
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Detail Rekam Medis Pasien</h1>
            <Card className='mb-6'>
                <CardHeader className="flex items-center gap-6">
                    {/* Kiri: Foto/Inisial */}
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-blue-800">
                            {getInitials(user ? user.name : '')} 
                        </span>
                    </div>

                    {/* Kanan: Grup Teks (Vertikal) */}
                    <div className="flex flex-col gap-1">
                        <CardTitle className='mb-1'>{user ? user.name : 'Memuat...'}</CardTitle>
                        <CardDescription className="text-sm">
                            ID: {user ? user.formatted_id : ''}
                        </CardDescription>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <div className="flex items-center gap-1.5">
                                <PhoneIcon className="w-3 h-3" />
                                <span>{user ? user.phone : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MailIcon className="w-3 h-3" />
                                <span>{user ? user.email : ''}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
            <div className="flex gap-2 mb-4"> {/* Tambah div pembungkus */}
                {/* Tombol Lihat Audit Log */}
                {!isLoading && !error && (
                    <Link href={`/audit-log/${patientId}`}>
                        <Button style={{boxShadow: "none", borderRadius: "5px"}} variant="outline">Lihat Audit Log</Button>
                    </Link>
                )}
                {/* Tombol Tambah Rekam Medis */}
                {!isLoading && !error && (
                    <Link href={`/records/new?patientId=${patientId}`}>
                        <Button style={{backgroundColor: "#3A81FF", color: "white", boxShadow: "none", borderRadius: "5px"}}>+ Tambah Rekam Medis</Button>
                    </Link>
                )}
            </div>
            {/* <p className="text-sm text-gray-500 mb-4 font-mono">ID: {patientId}</p> */}

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
                        <CardTitle className='mb-2'>{record.diagnosis}</CardTitle>

                        <CardDescription className="flex gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>
                                    {new Date(record.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span>
                                    {new Date(record.created_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </CardDescription>

                        <div className='mb-2'>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                            
                            {/* Tampilkan link ke lampiran jika ada */}
                            {record.attachment_cid && (
                                <a 
                                    href={`https://ipfs.io/ipfs/${record.attachment_cid}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    // ✅ Perubahan ClassNames untuk tampilan chip dan ikon
                                    className="
                                        inline-flex items-center gap-1.5 
                                        px-3 py-1 mt-3 
                                        bg-blue-50 text-blue-700 text-sm 
                                        rounded-full 
                                        border border-blue-200 
                                        text-xs
                                        hover:bg-blue-100 transition-colors
                                    "
                                >
                                    {/* ✅ Ikon Link di kiri */}
                                    <LinkIcon className="w-3 h-3" /> 
                                    Lihat Lampiran
                                </a>
                            )}
                        </div>

                        <p className="text-xs text-gray-500">Oleh: {record.doctor_name}</p>  
                    </CardHeader>
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