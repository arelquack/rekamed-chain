import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
// import { Badge } from '@/components/ui/badge'; // Kita coba pakai badge dari web, jika error, ganti dengan Text biasa

// PASTIKAN URL NGROK INI SESUAI DENGAN YANG ADA DI TERMINAL LO
const API_URL = 'https://5a121f6a66ba.ngrok-free.app'; // <-- GANTI DENGAN URL NGROK-MU

interface AccessLog {
  doctor_name: string;
  action: string;
  record_diagnosis: string;
  timestamp: string;
  status: string;
}

export default function AccessLogScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) { setError('Token tidak ditemukan.'); setIsLoading(false); return; }

    try {
      const response = await fetch(`${API_URL}/log-access`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil data log akses.');
      const data = await response.json();
      setLogs(data || []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLogs();
    }, [])
  );

  const renderItem = ({ item }: { item: AccessLog }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.action}>{item.action}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.detail}>Oleh: {item.doctor_name}</Text>
        {item.record_diagnosis && <Text style={styles.detail}>Diagnosis: {item.record_diagnosis}</Text>}
      </View>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString('id-ID')}</Text>
    </View>
  );

  if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

  return (
    <FlatList
      style={styles.container}
      data={logs}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.timestamp}-${index}`}
      ListHeaderComponent={<Text style={styles.title}>Riwayat Akses Data</Text>}
      ListEmptyComponent={<Text style={styles.centered}>Tidak ada riwayat akses.</Text>}
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    centered: { flex: 1, textAlign: 'center', marginTop: 50 },
    errorText: { color: 'red' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    action: { fontSize: 16, fontWeight: 'bold' },
    status: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
    cardBody: { marginBottom: 12 },
    detail: { fontSize: 14, color: '#333' },
    timestamp: { fontSize: 12, color: '#666', textAlign: 'right' },
});