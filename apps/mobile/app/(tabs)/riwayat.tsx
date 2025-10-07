import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// PASTIKAN URL NGROK INI SESUAI DENGAN YANG ADA DI TERMINAL LO
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // <-- GANTI DENGAN URL NGROK-MU

interface MedicalRecord {
    id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    created_at: string;
    attachment_cid?: string;
}

// Helper untuk menentukan ikon dan tag berdasarkan diagnosis
const getRecordType = (diagnosis: string): { icon: keyof typeof Feather.glyphMap, tag: string } => {
    const lowerDiagnosis = diagnosis.toLowerCase();
    if (lowerDiagnosis.includes('lab') || lowerDiagnosis.includes('gula darah')) {
        return { icon: 'thermometer', tag: 'Lab' };
    }
    if (lowerDiagnosis.includes('obat')) {
        return { icon: 'plus-circle', tag: 'Obat' };
    }
    // Default untuk kunjungan
    return { icon: 'clipboard', tag: 'Kunjungan' };
};

export default function RiwayatScreen() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Arel'); // Dummy name sesuai mockup

    const fetchRecords = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            setError('Token tidak ditemukan, silahkan login ulang.');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/records`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Gagal mengambil data riwayat medis.');
            const data = await response.json();
            setRecords(data || []);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('Terjadi kesalahan tidak diketahui.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
        fetchRecords();
        }, [])
    );

    const renderItem = ({ item }: { item: MedicalRecord }) => {
        const recordType = getRecordType(item.diagnosis);

        return (
            <View style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineLine} />
                    <View style={styles.iconCircle}>
                        <Feather name={recordType.icon} size={20} color="#007AFF" />
                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.diagnosis}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{recordType.tag}</Text>
                        </View>
                    </View>
                    <Text style={styles.cardMeta}>{new Date(item.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})} • {new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</Text>
                    <Text style={styles.cardContent}>{item.notes}</Text>

                    {item.attachment_cid && (
                        <TouchableOpacity 
                            style={styles.attachmentButton}
                            onPress={() => Linking.openURL(`${API_URL}/ipfs/${item.attachment_cid}`)}
                        >
                            <Feather name="paperclip" size={14} color="#007AFF" />
                            <Text style={styles.attachmentText}>Lihat Lampiran</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.cardDoctor}>Dokter: {item.doctor_name}</Text>
                </View>
            </View>
        );
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Riwayat Medis</Text>
                <Text style={styles.headerSubtitle}>{userName}</Text>
            </View>
            <Text style={styles.pageDescription}>Kronologi Perawatan</Text>
            <FlatList
                data={records}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.centered}>Belum ada riwayat medis.</Text>}
                contentContainerStyle={{ paddingHorizontal: 20 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef6ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignSelf: 'flex-start', // Agar button tidak full-width
    },
    attachmentText: {
        color: '#007AFF',
        marginLeft: 8,
        fontWeight: '500',
    },
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    centered: { flex: 1, textAlign: 'center', marginTop: 50 },
    errorText: { color: 'red' },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, marginTop: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 10 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 16, color: 'gray' },
    pageDescription: { paddingHorizontal: 20, marginBottom: 20, color: '#666' },
    timelineItem: { flexDirection: 'row', gap: 10 },
    timelineIconContainer: { alignItems: 'center' },
    timelineLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#e0eafc' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0eafc', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    card: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8 },
    badge: { backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: '500' },
    cardMeta: { fontSize: 12, color: 'gray', marginBottom: 8 },
    cardContent: { fontSize: 14, color: '#333', marginBottom: 12, lineHeight: 20 },
    cardDoctor: { fontSize: 12, color: 'gray', fontStyle: 'italic' },
});