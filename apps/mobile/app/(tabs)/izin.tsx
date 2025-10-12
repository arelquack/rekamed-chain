import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ActivityIndicator, Alert, 
    ScrollView, SafeAreaView, TouchableOpacity, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, Stack } from 'expo-router';
import { ethers } from 'ethers';
import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

// Pastikan URL sesuai backend lo
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

interface ConsentRequest {
    id: string;
    doctor_id: string;
    patient_id: string;
    status: 'pending' | 'granted' | 'revoked' | 'denied';
    created_at: string;

    // tambahan dari hasil join/fetch
    doctor_name?: string;
    clinic_name?: string;
    access_scope?: string;
}

interface Doctor {
    id: string;
    name: string;
    clinic_name: string;
    specialization: string;
}

export default function IzinScreen() {
    const [pendingRequests, setPendingRequests] = useState<ConsentRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<ConsentRequest[]>([]);
    const [inactiveRequests, setInactiveRequests] = useState<ConsentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Arel'); // dummy
    const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
    const [activeExpanded, setActiveExpanded] = useState(true);
    const [inactiveExpanded, setInactiveExpanded] = useState(true);

    // ✅ Ambil data consent + detail dokter
    const fetchRequests = async () => {
        try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token tidak ditemukan.');

        const consentRes = await fetch(`${API_URL}/consent/requests/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!consentRes.ok) throw new Error('Gagal mengambil data permintaan.');
        const consentData: ConsentRequest[] = await consentRes.json();

        // fetch data dokter berdasarkan doctor_id unik
        const doctorMap: Record<string, Doctor> = {};
        for (const req of consentData) {
            if (!doctorMap[req.doctor_id]) {
            const docRes = await fetch(`${API_URL}/doctors/${req.doctor_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (docRes.ok) {
                doctorMap[req.doctor_id] = await docRes.json();
            }
            }
        }

        // gabungkan hasilnya
        const combined = consentData.map(req => ({
            ...req,
            doctor_name: doctorMap[req.doctor_id]?.name || 'Tidak diketahui',
            clinic_name: doctorMap[req.doctor_id]?.clinic_name || '—',
            access_scope: 'Rekam Medis dan Riwayat Kunjungan',
        }));

        setPendingRequests(combined.filter(r => r.status === 'pending'));
        setActiveRequests(combined.filter(r => r.status === 'granted'));
        setInactiveRequests(combined.filter(r => r.status === 'revoked' || r.status === 'denied'));
        } catch (err) {
        if (err instanceof Error) setError(err.message);
        } finally {
        setIsLoading(false);
        }
    };

    useFocusEffect(React.useCallback(() => {
        fetchRequests();
    }, []));

    // ✅ Approve request
    const handleApprove = async (requestId: string, isTemporary: boolean = true) => {
        setLoadingRequestId(requestId);
        const token = await AsyncStorage.getItem('token');
        const privateKeyHex = await AsyncStorage.getItem('private_key');

        if (!token || !privateKeyHex) {
        Alert.alert('Error', 'Token atau private key tidak ditemukan.');
        setLoadingRequestId(null);
        return;
        }

        try {
        const wallet = new ethers.Wallet(privateKeyHex);
        const messageToSign = requestId + (isTemporary ? '_temp' : '_permanent');
        const signature = await wallet.signMessage(messageToSign);

        const response = await fetch(`${API_URL}/consent/sign/${requestId}`, {
            method: 'POST',
            headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ signature }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal menyetujui permintaan.');
        Alert.alert('Berhasil ✅', data.message || 'Permintaan berhasil disetujui.');
        fetchRequests();
        } catch (err) {
        if (err instanceof Error) Alert.alert('Gagal', err.message);
        } finally {
        setLoadingRequestId(null);
        }
    };

    // ✅ Deny request
    const handleDeny = async (requestId: string) => {
        setLoadingRequestId(requestId);
        const token = await AsyncStorage.getItem('token');
        if (!token) return Alert.alert('Error', 'Token tidak ditemukan.');

        try {
        const response = await fetch(`${API_URL}/consent/deny/${requestId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal menolak permintaan.');
        Alert.alert('Ditolak 🚫', data.message || 'Permintaan berhasil ditolak.');
        fetchRequests();
        } catch (err) {
        if (err instanceof Error) Alert.alert('Error', err.message);
        } finally {
        setLoadingRequestId(null);
        }
    };

    // ✅ Revoke izin aktif
    const handleRevoke = async (requestId: string) => {
        setLoadingRequestId(requestId);
        const token = await AsyncStorage.getItem('token');
        if (!token) return Alert.alert('Error', 'Token tidak ditemukan.');

        try {
        const response = await fetch(`${API_URL}/consent/revoke/${requestId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal mencabut izin.');
        Alert.alert('Dicabut 🔒', data.message || 'Izin berhasil dicabut.');
        fetchRequests();
        } catch (err) {
        if (err instanceof Error) Alert.alert('Error', err.message);
        } finally {
        setLoadingRequestId(null);
        }
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
                        <View>
                            <Text style={styles.appName}>RekamedChain</Text>
                            <Text style={styles.appSubtitle}>Manajemen Izin Akses</Text>
                        </View>
                    </View>
                </View>

    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        {/* ✅ Pending Requests */}
        {pendingRequests.length === 0 && activeRequests.length === 0 && inactiveRequests.length === 0 && (
            <View style={styles.emptyContainer}>
                <Feather name="shield" size={60} color="#c0c0c0" />
                <Text style={styles.emptyTitle}>Belum Ada Permintaan</Text>
                <Text style={styles.emptySubtitle}>
                    Semua permintaan izin akses dokter akan tampil di sini.
                </Text>
            </View>
        )}

        {/* Pending Requests */}
        {pendingRequests.map(req => (
            <View key={req.id} style={[styles.card, { backgroundColor: '#fff7ed' }]}>
                <View style={styles.cardHeader}>
                    <Feather name="alert-triangle" size={22} color="#F59E0B" />
                    <Text style={[styles.cardTitle, { color: '#D97706' }]}>
                        Permintaan Akses Baru!
                    </Text>
                </View>

                <Text style={styles.cardInfo}>
                    {req.doctor_name} • {req.clinic_name}
                </Text>
                <Text style={styles.cardDetails}>Akses ke: {req.access_scope}</Text>
                <Text style={styles.cardDate}>
                    Diminta pada {new Date(req.created_at).toLocaleString('id-ID')}
                </Text>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                        style={styles.primaryButton} 
                        onPress={() => handleApprove(req.id, true)}
                    >
                        <Feather name="check" size={16} color="white" />
                        <Text style={styles.primaryButtonText}>Setujui 24 Jam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.secondaryButton} 
                        onPress={() => handleApprove(req.id, false)}
                    >
                        <Feather name="check-circle" size={16} color="#007AFF" />
                        <Text style={styles.secondaryButtonText}>Setujui Selamanya</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.denyButton}
                        onPress={() => handleDeny(req.id)}
                    >
                        <Feather name="x-circle" size={16} color="#EF4444" />
                        <Text style={styles.denyButtonText}>Tolak</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ))}

        {/* Active Requests */}
        <View style={styles.section}>
            <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => setActiveExpanded(!activeExpanded)}
            >
                <Text style={styles.sectionTitle}>Izin Aktif ({activeRequests.length})</Text>
                <Feather name={activeExpanded ? "chevron-up" : "chevron-down"} size={24} color="#111" />
            </TouchableOpacity>

            {activeExpanded && activeRequests.map(req => (
                <View key={req.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="user-check" size={20} color="#007AFF" />
                        <Text style={styles.cardTitle}>{req.doctor_name}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>{req.clinic_name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Aktif</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.revokeButton}
                        onPress={() => handleRevoke(req.id)}
                    >
                        <Feather name="lock" size={14} color="#EF4444" />
                        <Text style={styles.revokeText}>Cabut Izin</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        {/* Inactive Requests */}
        <View style={styles.section}>
            <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => setInactiveExpanded(!inactiveExpanded)}
            >
                <Text style={styles.sectionTitle}>Izin Tidak Aktif ({inactiveRequests.length})</Text>
                <Feather name={inactiveExpanded ? "chevron-up" : "chevron-down"} size={24} color="#111" />
            </TouchableOpacity>

            {inactiveExpanded && inactiveRequests.map(req => (
                <View key={req.id} style={[styles.card, { opacity: 0.7 }]}>
                    <View style={styles.cardHeader}>
                        <Feather name="user-x" size={20} color="#666" />
                        <Text style={styles.cardTitle}>{req.doctor_name}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>{req.clinic_name}</Text>
                    <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                        <Text style={[styles.badgeText, { color: '#EF4444' }]}>Dicabut</Text>
                    </View>
                </View>
            ))}
        </View>
    </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20, 
        paddingTop: 30, 
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    logo: { width: 36, height: 36, marginRight: 12, resizeMode: 'contain' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    appSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111' },

    card: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16,
        shadowColor: '#000', 
        shadowOpacity: 0.08, 
        shadowRadius: 6, 
        elevation: 2 
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#111' },
    cardSubtitle: { color: '#666', fontSize: 13, marginBottom: 8 },
    cardInfo: { fontSize: 14, color: '#444' },
    cardDetails: { fontSize: 13, color: '#666', marginTop: 4 },
    cardDate: { fontSize: 12, color: '#888', marginTop: 8 },

    badge: { backgroundColor: '#D1FAE5', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },

    buttonGroup: { marginTop: 16, gap: 10 },
    primaryButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 15 },
    secondaryButton: { backgroundColor: '#eef6ff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    secondaryButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
    denyButton: { padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    denyButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },

    revokeButton: { borderWidth: 1, borderColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-end', marginTop: 12 },
    revokeText: { color: '#EF4444', fontWeight: '600' },

    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, color: '#333' },
    emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20 },

    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
