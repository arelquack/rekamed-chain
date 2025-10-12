import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// PASTIKAN URL NGROK INI SESUAI DENGAN YANG ADA DI TERMINAL LO
const API_URL = 'https://5a121f6a66ba.ngrok-free.app'; // <-- GANTI DENGAN URL NGROK-MU

interface MedicalRecord {
    id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    created_at: string;
    attachment_cid?: string;
}

interface ConsentRequest {
    id: string;
    doctor_id: string; // Nanti kita bisa fetch nama dokter berdasarkan ID ini
    status: 'pending' | 'granted' | 'revoked' | 'denied';
    created_at: string;
}

export default function DashboardScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [pendingConsents, setPendingConsents] = useState<ConsentRequest[]>([]);
  const [userName, setUserName] = useState('Arel'); // Nama dummy sesuai mockup
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchData = async () => {
      setIsLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
          setError('Token tidak ditemukan, silahkan login ulang.');
          setIsLoading(false);
          return;
      }

      try {
          // Ambil data rekam medis dan permintaan izin secara bersamaan
          const [userData, recordsResponse, consentsResponse] = await Promise.all([
              fetch(`${API_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch(`${API_URL}/records`, { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch(`${API_URL}/consent/requests/me`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (!userData.ok) throw new Error('Gagal mengambil data pengguna.');
          if (!recordsResponse.ok) throw new Error('Gagal mengambil data riwayat medis.');
          if (!consentsResponse.ok) throw new Error('Gagal mengambil data permintaan izin.');

          const user = await userData.json();
          const recordsData = await recordsResponse.json();
          const consentsData = await consentsResponse.json();

          setUserName(user.name || 'Pengguna');
          setRecords(recordsData || []);
          // Saring hanya permintaan yang statusnya 'pending'
          setPendingConsents((consentsData || []).filter((req: ConsentRequest) => req.status === 'pending'));

      } catch (err) {
          if (err instanceof Error) {
              setError(err.message);
          } else {
              setError('Terjadi kesalahan tidak diketahui.');
          }
      } finally {
          setIsLoading(false);
      }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const latestRecord = records?.[0];
  const latestConsent = pendingConsents?.[0];

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header Pengguna */}
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Feather name="user" size={24} color="#007AFF" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userId}>ID: MED-2025-001</Text>
          </View>
          <TouchableOpacity>
            <Feather name="bell" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Notifikasi Permintaan Akses Baru */}
        {latestConsent && (
            <View style={styles.consentCard}>
                <View style={styles.consentIcon}>
                    <Feather name="shield" size={20} color="#007AFF" />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.consentText}>Dr. Arief Spesialis Anak Dalam meminta akses ke riwayat Anda.</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/izin')}>
                        <Text style={styles.consentLink}>Lihat Permintaan Akses</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        {/* Kartu Ringkasan */}
        <View style={[styles.card, { marginTop: latestConsent ? 10 : 20 }]}>
            <View style={styles.cardTitleContainer}>
                <Feather name="activity" size={20} color="#666" />
                <Text style={styles.sectionTitle}>Ringkasan Kesehatan</Text>
            </View>
            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Kunjungan Terakhir</Text>
                <Text style={styles.cardValue}>{latestRecord ? new Date(latestRecord.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : '-'}</Text>
            </View>
            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Diagnosis</Text>
                <View style={styles.badgeWarning}>
                <Text style={styles.badgeText}>{latestRecord?.diagnosis || '-'}</Text>
                </View>
            </View>
            <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Status</Text>
                <View style={styles.badgeSuccess}>
                <Text style={styles.badgeText}>Stabil</Text>
                </View>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center' },
  errorText: { color: 'red' },
  userHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginTop: Platform.OS === 'android' ? 25 : 0 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0eafc', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1a202c' },
  userId: { fontSize: 14, color: 'gray' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a202c' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width: 0, height: 2} },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12},
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  cardLabel: { fontSize: 16, color: '#666' },
  cardValue: { fontSize: 16, fontWeight: '500' },
  badgeWarning: { backgroundColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeSuccess: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontWeight: '600', color: '#1a202c' },
  consentCard: { flexDirection: 'row', backgroundColor: '#e0eafc', borderRadius: 12, padding: 16, marginHorizontal: 20, marginTop: 20, alignItems: 'center', gap: 12 },
  consentIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'},
  consentText: { fontSize: 14, fontWeight: '500', flexWrap: 'wrap', marginBottom: 4, lineHeight: 20 },
  consentLink: { color: '#007AFF', fontWeight: 'bold', marginTop: 4 }
});