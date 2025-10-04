// apps/web/src/app/ledger/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LedgerBlock {
  block_id: number;
  record_id: string;
  data_hash: string;
  previous_hash: string;
  created_at: string;
}

export default function LedgerPage() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLedger = async () => {
      const token = localStorage.getItem('token');
      if (!token) { /* ... */ return; }
      try {
        const response = await fetch('http://localhost:8080/ledger', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal mengambil data ledger.');
        const data = await response.json();
        setBlocks(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Ledger (Simulasi)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Memuat data ledger...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!isLoading && !error && (
              <Table>
                <TableCaption>Daftar transaksi yang tercatat di ledger.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Block ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Data Hash</TableHead>
                    <TableHead>Previous Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.block_id}>
                      <TableCell className="font-medium">{block.block_id}</TableCell>
                      <TableCell>{new Date(block.created_at).toLocaleString('id-ID')}</TableCell>
                      <TableCell className="font-mono text-xs">{block.data_hash}</TableCell>
                      <TableCell className="font-mono text-xs">{block.previous_hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}