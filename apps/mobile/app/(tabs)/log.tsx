import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// GANTI URL NGROK SESUAI TERMINAL
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

interface AccessLog {
    doctor_name: string;
    action: string;
    record_diagnosis: string;
    timestamp: string;
    status: string;
}

interface LogSection {
    title: string;
    data: AccessLog[];
}

// Helper untuk mengelompokkan log berdasarkan tanggal
const groupLogsByDate = (logs: AccessLog[]): LogSection[] => {
    if (!logs || logs.length === 0) return [];
    const grouped = logs.reduce((acc, log) => {
        const date = new Date(log.timestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, AccessLog[]>);

    return Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date],
    }));
};

export default function LogAksesScreen() {
    const [logSections, setLogSections] = useState<LogSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Arel'); // Dummy name
    const router = useRouter();

    const fetchLogs = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) { setError('Token tidak ditemukan.'); setIsLoading(false); return; }

        try {
            const response = await fetch(`${API_URL}/log-access`, {
            headers: { 'Authorization': `Bearer ${token}` },
            });

            let data = [];
            if (response.ok && response.status !== 204) {
            const json = await response.json();
            data = Array.isArray(json) ? json : [];
            }

            setLogSections(groupLogsByDate(data));
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoading(false);
        }
        };

    useFocusEffect(React.useCallback(() => { fetchLogs(); }, []));

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
        case 'aktif': case 'terverifikasi': case 'granted':
            return { badge: styles.statusBadgeGreen, text: styles.statusTextGreen, name: "Aktif" };
        case 'kadaluarsa':
            return { badge: styles.statusBadgeGray, text: styles.statusTextGray, name: "Kadaluarsa" };
        case 'ditolak': case 'revoked': case 'denied':
            return { badge: styles.statusBadgeRed, text: styles.statusTextRed, name: "Ditolak" };
        default:
            return { badge: styles.statusBadgeGray, text: styles.statusTextGray, name: status };
        }
    }

    const renderItem = ({ item }: { item: AccessLog }) => {
        const statusStyle = getStatusStyle(item.status);
        const detailText = item.record_diagnosis && item.record_diagnosis.length < 50 ? item.record_diagnosis : item.action;

        return (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>
                {item.doctor_name.startsWith('dr.') ? item.doctor_name : `dr. ${item.doctor_name}`}
            </Text>
            <Text style={styles.itemSubtitle}>RSUD Kiwari (dummy)</Text>

            <View style={styles.itemDetailRow}>
                <Feather name={item.action.includes('rekam medis') ? 'eye' : 'shield'} size={14} color="#666" />
                <Text style={styles.itemInfo}>{detailText}</Text>
            </View>

            <Text style={styles.itemAccess}>Akses 24 jam</Text>
            </View>

            <View style={styles.itemRight}>
            <View style={statusStyle.badge}>
                <Text style={statusStyle.text}>{statusStyle.name}</Text>
            </View>
            <TouchableOpacity>
                <Text style={styles.detailLink}>Detail</Text>
            </TouchableOpacity>
            </View>
        </View>
        );
    };

    if (isLoading) return <ActivityIndicator size="large" style={styles.centered} />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Log Akses</Text>
            <Text style={styles.headerSubtitle}>{userName}</Text>
        </View>

            <Text style={styles.pageDescription}>
            Semua akses ke data medis Anda tercatat dan terverifikasi blockchain.
            </Text>

            <SectionList
            sections={logSections}
            keyExtractor={(item, index) => item.timestamp + index}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ListEmptyComponent={<Text style={styles.centered}>Tidak ada riwayat akses.</Text>}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ backgroundColor: '#f0f4f8' }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    centered: { textAlign: 'center', marginTop: 50, paddingHorizontal: 20 },
    errorText: { color: 'red' },

    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginTop: (Platform.OS === 'android' ? 25 : 0),
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 16, color: 'gray' },

    pageDescription: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        color: '#666',
        fontSize: 15,
        lineHeight: 22,
        backgroundColor: '#f0f4f8',
    },
    sectionHeader: {
        fontWeight: '600',
        fontSize: 14,
        color: '#666',
        paddingVertical: 8,
    },

    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },

    itemRight: { alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 60 },
    itemTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
    itemSubtitle: { color: 'gray', fontSize: 13, marginBottom: 8 },
    itemDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    itemInfo: { color: '#333', fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
    itemAccess: { color: '#666', fontSize: 12, marginLeft: 20, fontStyle: 'italic' },

    statusBadgeGreen: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusTextGreen: { color: '#065F46', fontWeight: '600', fontSize: 12 },
    statusBadgeGray: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusTextGray: { color: '#4B5563', fontWeight: '600', fontSize: 12 },
    statusBadgeRed: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusTextRed: { color: '#991B1B', fontWeight: '600', fontSize: 12 },

    detailLink: { color: '#007AFF', marginTop: 10, fontWeight: '500' },
});