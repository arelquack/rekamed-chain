'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  formatted_id: string;
}

export default function NewRecordPage() {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const idFromUrl = searchParams.get('patientId');
        if (idFromUrl) {
            setPatientId(idFromUrl); // Isi state dengan ID dari URL
        }
        const fetchUserDetail = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const userResponse = await fetch(`http://localhost:8080/users/detail/${searchParams.get('patientId')}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!userResponse.ok) {
                throw new Error('Gagal mengambil profil pasien.');
                }

                const userData = await userResponse.json();
                setUser(userData);
            } catch (err) {
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetail();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        const token = localStorage.getItem('token');

        if (!token) {
        setMessage('Error: Anda harus login untuk melakukan aksi ini.');
        setIsLoading(false);
        return;
        }

        let attachmentCid = "";

        try {
        // TAHAP 1: UPLOAD FILE JIKA ADA
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('http://localhost:8080/upload', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: formData,
            });
            
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
            throw new Error(uploadData.message || 'Gagal upload file.');
            }
            attachmentCid = uploadData.cid;
        }

        // TAHAP 2: KIRIM DATA REKAM MEDIS
        const recordResponse = await fetch('http://localhost:8080/records', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
            patient_id: patientId,
            diagnosis,
            notes,
            attachment_cid: attachmentCid,
            }),
        });

        const recordData = await recordResponse.json();
        if (!recordResponse.ok) {
            throw new Error(recordData.message || 'Gagal menambahkan rekam medis.');
        }
        
        alert('Sukses! Rekam medis berhasil ditambahkan.');

        // Alihkan dokter kembali ke halaman detail pasien yang baru di-update
        router.push(`/patients/${patientId}`);

        } catch (error) {
        if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
            alert(`Error: ${error.message}`);
        } else {
            setMessage('Terjadi kesalahan yang tidak diketahui.');
        }
        } finally {
        setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        const words = name.split(' ');
        const initials = words[0][0] + (words.length > 1 ? words[1][0] : '');
        return initials.toUpperCase();
    };

    return (
        <main className="flex flex-col items-center justify-center p-8" style={{backgroundColor: "#F4F5FA", height: "100%"}}>
        <div className="flex flex-col items-center justify-center gap-0 mb-6">
            <div className='text-center'>
                <h1 className="text-3xl font-bold mb-2">Catat Data Medis Baru</h1>
                <p className='text-gray-600'>Input data medis pasien ke dalam sistem blockchain RekamedChain</p>
            </div>
        </div>
        <Card className="w-[450px] mb-6">
            <CardHeader className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-blue-800">
                        {getInitials(user ? user.name : '')} 
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <CardTitle className='mb-1'>{user ? user.name : 'Memuat...'}</CardTitle>
                    <CardDescription className="text-sm">
                        ID: {user ? user.formatted_id : ''}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card className="w-[450px]">
            <CardHeader>
            <CardTitle>Formulir Data Medis</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                {/* <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="patientId">ID Pasien</Label>
                    <Input
                    id="patientId"
                    placeholder="Masukkan ID Pasien"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    readOnly={searchParams.has('patientId')}
                    />
                </div> */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                    style={{borderRadius: 5, marginTop: "4px"}} 
                    id="diagnosis"
                    placeholder="Contoh: Hipertensi, Diabetes Tipe 2"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                    style={{borderRadius: 5, marginTop: "4px"}} 
                    id="notes"
                    placeholder="Catatan observasi, resep, anjuran, dll."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="attachment">Lampiran (Opsional)</Label>
                    <Input
                    style={{borderRadius: 5, marginTop: "4px"}} 
                    id="attachment"
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={isLoading} style={{backgroundColor: "#3A81FF", color: "white", boxShadow: "none", borderRadius: "5px"}}>
                    {isLoading ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                </Button>
            </form>
            {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </CardContent>
        </Card>
        </main>
    );
}