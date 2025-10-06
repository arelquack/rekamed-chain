'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewRecordPage() {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const idFromUrl = searchParams.get('patientId');
        if (idFromUrl) {
        setPatientId(idFromUrl); // Isi state dengan ID dari URL
        }
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

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
        <Card className="w-[450px]">
            <CardHeader>
            <CardTitle>Tambah Rekam Medis Baru</CardTitle>
            <CardDescription>Isi detail rekam medis untuk pasien.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="patientId">ID Pasien</Label>
                    <Input
                    id="patientId"
                    placeholder="Masukkan ID Pasien"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    readOnly={searchParams.has('patientId')}
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
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
                    id="notes"
                    placeholder="Catatan observasi, resep, anjuran, dll."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="attachment">Lampiran (Opsional)</Label>
                    <Input
                    id="attachment"
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                </Button>
            </form>
            {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </CardContent>
        </Card>
        </main>
    );
}