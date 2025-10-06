'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Silakan cari pasien berdasarkan nama atau email.');

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setMessage('Mencari...');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/users/search?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Pencarian gagal.');
      
      const data = await response.json();
      setResults(data);
      if (data.length === 0) {
        setMessage('Pasien tidak ditemukan.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat mencari.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pencarian Pasien</h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="Cari nama atau email pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Mencari...' : 'Cari'}</Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.length > 0 ? (
            results.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Nanti tombol ini bisa dipakai untuk minta izin */}
                  <Button className="w-full">Minta Izin Akses</Button>
                </CardContent>
              </Card>
            ))
          ) : (
            !isLoading && <p>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}