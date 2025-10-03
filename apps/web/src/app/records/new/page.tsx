'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // <-- Import komponen baru

export default function NewRecordPage() {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        try {
        const response = await fetch('http://localhost:8080/records', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
            patient_id: patientId,
            diagnosis,
            notes,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Gagal menambahkan rekam medis.');
        }

        setMessage(`Sukses! Rekam medis baru telah ditambahkan dengan ID: ${data.recordID}`);
        // Kosongkan form setelah sukses
        setPatientId('');
        setDiagnosis('');
        setNotes('');

        } catch (error) {
        if (error instanceof Error) {
            setMessage(error.message);
        } else {
            setMessage('Terjadi kesalahan yang tidak diketahui.');
        }
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
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