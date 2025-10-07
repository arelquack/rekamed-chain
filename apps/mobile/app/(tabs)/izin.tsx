import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, Stack } from 'expo-router';
import { ethers } from 'ethers';
import { Feather } from '@expo/vector-icons';

// PASTIKAN URL NGROK INI SESUAI
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

interface ConsentRequest {
    id: string;
    doctor_id: string;
    status: 'pending' | 'granted' | 'revoked' | 'denied';
    created_at: string;
}

// Data dummy untuk memperkaya UI sesuai mockup
const dummyDoctorData: { [key: string]: { name: string; clinic: string } } = {
    'default': { name: 'Dr. Budi Santoso', clinic: 'Poliklinik Penyakit Dalam, RSUD Kiwari' },
    'another': { name: 'Dr. Ani Sari', clinic: 'Laboratorium Klinik ProSehat' },
    'third': { name: 'Apoteker Maya', clinic: 'Instalasi Farmasi, RSUD Cimahi' },
    'revoked_1': { name: 'Dr. Eko Wardoyo', clinic: 'Unit Gawat Darurat, RSUD Kiwari' },
    'revoked_2': { name: 'Dr. Lisa Anggraini', clinic: 'Poliklinik Kulit, RSUD Bandung' },
};

export default function IzinScreen() {
    const [pendingRequests, setPendingRequests] = useState<ConsentRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<ConsentRequest[]>([]);
    const [inactiveRequests, setInactiveRequests] = useState<ConsentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Arel'); // Dummy name
    
    // State untuk mengontrol dropdown/accordion
    const [activeExpanded, setActiveExpanded] = useState(true);
    const [inactiveExpanded, setInactiveExpanded] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) { setError('Token tidak ditemukan.'); setIsLoading(false); return; }
        try {
            const response = await fetch(`${API_URL}/consent/requests/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Gagal mengambil data permintaan.');
            const data: ConsentRequest[] = await response.json();
            setPendingRequests(data.filter(req => req.status === 'pending'));
            setActiveRequests(data.filter(req => req.status === 'granted'));
            setInactiveRequests(data.filter(req => req.status === 'revoked' || req.status === 'denied'));
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(React.useCallback(() => { fetchRequests(); }, []));

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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server merespon dengan status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        Alert.alert('Sukses', data.message || 'Permintaan berhasil disetujui!');
        fetchRequests();

        } catch (err) {
        if (err instanceof Error) {
            Alert.alert('DEBUG: Terjadi Error', err.message);
        }
        }
    };


    const handleAction = (action: 'deny' | 'revoke') => {
        Alert.alert('Fitur Segera Hadir', `Fungsionalitas untuk '${action}' akan diimplementasikan setelah endpoint backend siap.`);
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Manajemen Izin Akses</Text>
                <Text style={styles.headerSubtitle}>{userName}</Text>
            </View>
            {/* Bagian Permintaan Baru */}
            {pendingRequests.map(req => (
            <View key={req.id} style={styles.section}>
                <View style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                    <View style={styles.warningIcon}><Feather name="alert-triangle" size={16} color="#F59E0B" /></View>
                    <Text style={styles.pendingTitle}>Permintaan Akses Baru!</Text>
                </View>
                <Text style={styles.pendingInfo}>{dummyDoctorData['default'].name} - {dummyDoctorData['default'].clinic}</Text>
                <Text style={styles.pendingDetails}>Meminta akses ke: Riwayat Diagnosis dan Hasil Laboratorium</Text>
                <Text style={styles.pendingTime}>Diminta pada: {new Date(req.created_at).toLocaleString('id-ID')}</Text>
                
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => handleApprove(req.id)}>
                    <Feather name="check-circle" size={16} color="white" />
                    <Text style={styles.primaryButtonText}>Setujui untuk 24 Jam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => handleApprove(req.id)}>
                    <Feather name="check-circle" size={16} color="#007AFF" />
                    <Text style={styles.secondaryButtonText}>Setujui Selamanya</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tertiaryButton} onPress={() => handleAction('deny')}>
                    <Feather name="x-circle" size={16} color="#EF4444" />
                    <Text style={styles.tertiaryButtonText}>Tolak</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
            ))}

            {/* Bagian Izin Aktif (Collapsible) */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => setActiveExpanded(!activeExpanded)}>
                    <Text style={styles.sectionTitle}>Izin yang Aktif ({activeRequests.length})</Text>
                    <Feather name={activeExpanded ? "chevron-up" : "chevron-down"} size={24} color="black" />
                </TouchableOpacity>
                {activeExpanded && activeRequests.map((req, index) => (
                    <View key={req.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Feather name="user" size={20} color="#666" />
                            <View style={{flex: 1, marginLeft: 12}}>
                                <Text style={styles.itemTitle}>{dummyDoctorData[index === 0 ? 'another' : 'default'].name}</Text>
                                <Text style={styles.itemSubtitle}>{dummyDoctorData[index === 0 ? 'another' : 'default'].clinic}</Text>
                            </View>
                            <View style={styles.statusBadgeGreen}><Text style={styles.statusBadgeText}>Aktif</Text></View>
                        </View>
                        <Text style={styles.itemInfo}>Akses: Hasil Laboratorium • Berlaku hingga: Selamanya</Text>
                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.revokeButton} onPress={() => handleAction('revoke')}>
                                <Text style={styles.revokeButtonText}>Cabut Izin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Bagian Izin Tidak Aktif (Collapsible) */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => setInactiveExpanded(!inactiveExpanded)}>
                    <Text style={styles.sectionTitle}>Izin yang Dicabut/Kadaluarsa ({inactiveRequests.length})</Text>
                    <Feather name={inactiveExpanded ? "chevron-up" : "chevron-down"} size={24} color="black" />
                </TouchableOpacity>
                {inactiveExpanded && inactiveRequests.map((req, index) => (
                    <View key={req.id} style={[styles.itemCard, {opacity: 0.7}]}>
                        <View style={styles.itemHeader}>
                            <Feather name="user-x" size={20} color="#666" />
                            <View style={{flex: 1, marginLeft: 12}}>
                                <Text style={styles.itemTitle}>{dummyDoctorData[index === 0 ? 'revoked_1' : 'revoked_2'].name}</Text>
                                <Text style={styles.itemSubtitle}>{dummyDoctorData[index === 0 ? 'revoked_1' : 'revoked_2'].clinic}</Text>
                            </View>
                            <View style={styles.statusBadgeRed}><Text style={styles.statusBadgeText}>Dicabut</Text></View>
                        </View>
                        <Text style={styles.itemInfo}>Akses: Riwayat Alergi • Dicabut oleh Pasien</Text>
                    </View>
                ))}
            </View>

        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red' },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 20, marginTop: (Platform.OS === 'android' ? 25 : 0) },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 16, color: 'gray', marginBottom: 10 },
    section: { marginBottom: 10, },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    pendingCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginHorizontal: 20, borderWidth: 1, borderColor: '#FDE68A' },
    pendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    warningIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
    pendingTitle: { fontWeight: 'bold', color: '#D97706' },
    pendingInfo: { fontWeight: '600', marginBottom: 4 },
    pendingDetails: { color: '#666', marginBottom: 4 },
    pendingTime: { fontSize: 12, color: '#888', marginBottom: 16},
    buttonGroup: { gap: 10, marginTop: 8 },
    primaryButton: { flexDirection: 'row', gap: 8, backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { flexDirection: 'row', gap: 8, backgroundColor: 'white', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#007AFF'},
    secondaryButtonText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
    tertiaryButton: { flexDirection: 'row', gap: 8, padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    tertiaryButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
    
    itemCard: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16, 
        marginHorizontal: 20, 
        marginBottom: 12, 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 5
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
    itemSubtitle: { color: 'gray', fontSize: 13, marginBottom: 6 },
    itemInfo: { color: '#666', fontSize: 12, marginLeft: 32, marginBottom: 12 },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        marginTop: 8,
        alignItems: 'flex-end'
    },
    statusBadgeGreen: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusBadgeRed: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusBadgeText: { fontWeight: '600', fontSize: 12, color: '#1a202c' },
    revokeButton: { 
        borderWidth: 1, 
        borderColor: '#EF4444', 
        borderRadius: 8, 
        paddingHorizontal: 12, 
        paddingVertical: 6 
    },
    revokeButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
});