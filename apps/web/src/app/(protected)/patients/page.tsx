// apps/web/src/app/patients/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface PublicUser {
  id: string;
  name: string;
  email: string;
  consent_status: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fungsi untuk handle pencarian
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/users/search?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Pencarian gagal.');
        
      const data = await response.json();
      setResults(data);
      if (data.length === 0) {
        setMessage('Pasien tidak ditemukan');
      } else {
        setMessage(data.length + ' pasien ditemukan');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat mencari');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI BARU UNTUK MINTA IZIN ---
  const handleRequestConsent = async (patientId: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/consent/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ patient_id: patientId }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim permintaan izin.');
      }
      
      const data = await response.json();
      alert(`Sukses! Permintaan izin berhasil dikirim. ID Permintaan: ${data.request_id}`);
      
    } catch (error) {
      if(error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const renderConsentButton = (user: PublicUser) => {
  // Fungsi onClick untuk meminta izin
  const onRequestAccess = () => handleRequestConsent(user.id);

  switch (user.consent_status) {
    case 'granted':
      // 1. Izin Diberikan -> Tombol untuk melihat profil
      return (
        <Link href={`/patients/${user.id}`}>
          <Button 
            className="w-full" 
            style={{backgroundColor: "#3A81FF", color: "white", boxShadow: "none", borderRadius: "5px"}}
          >
            Lihat Profil
          </Button>
        </Link>
      );

    case 'pending':
      // 2. Izin Tertunda -> Tombol non-aktif
      return (
        <Button
          disabled
          className="w-full"
          style={{backgroundColor: "#E5E7EB", color: "#6B7281", cursor: "not-allowed", boxShadow: "none", borderRadius: "5px"}}
        >
          Menunggu Persetujuan
        </Button>
      );

    case 'denied':
    case 'revoked':
      // 3. Izin Ditolak atau Dicabut -> Tombol untuk meminta lagi
      return (
        <Button
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" // Gaya untuk menandakan penolakan
          style={{boxShadow: "none", borderRadius: "5px"}}
          onClick={onRequestAccess}
        >
          {user.consent_status === 'denied' ? 'Akses Ditolak, Minta Lagi?' : 'Akses Dicabut, Minta Lagi?'}
        </Button>
      );

    case 'not_requested':
    default:
      // 4. Default / Belum diminta -> Tombol utama untuk meminta izin
      return (
        <Button
          variant="outline"
          className="w-full"
          style={{backgroundColor: "#F4F5FA", boxShadow: "none", borderRadius: "5px"}}
          onClick={onRequestAccess}
        >
          Minta Izin Akses
        </Button>
      );
  }
};


  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.split(' ');
    const initials = words[0][0] + (words.length > 1 ? words[1][0] : '');
    return initials.toUpperCase();
  };

  return (
    <div className="p-8 m-0" style={{backgroundColor: "#F4F5FA", height: "100%"}}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">Pencarian Pasien</h1>
        <p className="text-sm text-gray-600 mb-8">Cari dan akses data pasien dengan aman</p>
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 p-5 rounded-md border" style={{backgroundColor: "#FFFFFF"}}>
          <Input
            style={{height: "42px", backgroundColor: "#F4F5FA", boxShadow: "none", borderRadius: "5px"}}
            placeholder="Cari pasien berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" style={{height: "42px", padding: "0px 30px", backgroundColor: isLoading ? "#434f64ff" : "#3A81FF", borderRadius: "5px" }} disabled={isLoading}>{'Cari'}</Button>
        </form>

        {/* Menampilkan pesan status di atas hasil pencarian */}
       {results.length > 0 ? <p className={`text-left ${isLoading ? 'text-sm text-gray-600' : 'text-lg font-semibold'}`}>Hasil Pencarian</p> : <></>}
       
        <p className={`mb-4 text-left ${isLoading || results.length > 0 ? 'text-sm text-gray-600' : 'text-lg font-semibold'}`}>
          {isLoading ? "Mencari pasien..." : message}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.length > 0 &&
            results.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  {/* Foto Profil */}
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-semibold text-blue-800">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {renderConsentButton(user)}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );

  

}