'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessLog {
  doctor_name: string;
  action: string;
  record_diagnosis: string;
  timestamp: string;
  status: string;
}

export default function AuditLogPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    const token = localStorage.getItem('token');
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://localhost:8080/log-access/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal mengambil data log.');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [patientId]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Audit Log untuk Pasien</CardTitle>
            <p className="text-sm text-gray-500 font-mono pt-2">{patientId}</p>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Memuat log...</p> : (
              <Table>
                <TableCaption>Jejak audit aktivitas pada data pasien ini.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Aktor</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{log.doctor_name}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.record_diagnosis}</TableCell>
                      <TableCell>{log.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}