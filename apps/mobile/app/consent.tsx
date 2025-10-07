// apps/mobile/app/consent.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { ethers } from 'ethers';

// PASTIKAN URL NGROK INI SESUAI DENGAN YANG ADA DI TERMINAL LO
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // <-- GANTI DENGAN URL NGROK-MU

interface ConsentRequest {
  id: string;
  doctor_id: string;
  status: 'pending' | 'granted' | 'revoked' | 'denied';
  created_at: string;
}

export default function ConsentScreen() {
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        setError('Token tidak ditemukan.');
        setIsLoading(false);
        return;
    }
    try {
      const response = await fetch(`${API_URL}/consent/requests/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil data permintaan.');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect akan menjalankan fetchRequests setiap kali layar ini dibuka/difokuskan
  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const handleApprove = async (requestId: string) => {
    const token = await AsyncStorage.getItem('token');
    const privateKeyHex = await AsyncStorage.getItem('private_key');

    if (!token || !privateKeyHex) {
      Alert.alert('Error', 'Kunci otentikasi atau kunci privat tidak ditemukan.');
      return;
    }
    
    try {
      const wallet = new ethers.Wallet(privateKeyHex);
      const messageToSign = requestId;
      const signature = await wallet.signMessage(messageToSign);

      const response = await fetch(`${API_URL}/consent/sign/${requestId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: signature })
      });

      // --- DEBUGGER DIMULAI DI SINI ---
      if (!response.ok) {
        // Coba baca respon error dari server sebagai teks
        const errorText = await response.text();
        throw new Error(`Server merespon dengan status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      Alert.alert('Sukses', data.message || 'Permintaan berhasil disetujui!');
      fetchRequests();

    } catch (err) {
      if (err instanceof Error) {
        // Tampilkan pesan error yang lebih detail
        Alert.alert('DEBUG: Terjadi Error', err.message);
      }
    }
  };

  const renderItem = ({ item }: { item: ConsentRequest }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Permintaan dari Dokter</Text>
      <Text style={styles.cardText}>ID: {item.doctor_id}</Text>
      <Text style={styles.cardText}>Status: <Text style={{fontWeight: 'bold'}}>{item.status}</Text></Text>
      {item.status === 'pending' && (
        <View style={{marginTop: 10}}>
            <Button title="Setujui Akses" onPress={() => handleApprove(item.id)} />
        </View>
      )}
    </View>
  );

  if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

  return (
    <FlatList
      style={styles.container}
      data={requests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.centered}>Tidak ada permintaan izin.</Text>}
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red' },
    card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    cardText: { fontSize: 14, color: '#333', marginBottom: 4 },
});