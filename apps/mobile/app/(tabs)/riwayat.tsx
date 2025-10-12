import React, { useCallback, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    SafeAreaView, 
    TouchableOpacity, 
    Linking, 
    Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
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

// Helper untuk menentukan ikon, tag, dan warna badge
const getRecordType = (diagnosis: string): { icon: keyof typeof Feather.glyphMap, tag: string, color: string } => {
    const lowerDiagnosis = diagnosis.toLowerCase();
    if (lowerDiagnosis.includes('lab') || lowerDiagnosis.includes('gula darah')) {
        return { icon: 'thermometer', tag: 'Hasil Lab', color: '#eef6ff' };
    }
    if (lowerDiagnosis.includes('obat') || lowerDiagnosis.includes('resep')) {
        return { icon: 'plus-circle', tag: 'Resep Obat', color: '#eef6ff' };
    }
    // Default untuk kunjungan
    return { icon: 'clipboard', tag: 'Kunjungan', color: '#eef6ff' };
};

// Komponen untuk tampilan saat data kosong
const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Feather name="file-text" size={60} color="#c0c0c0" />
        <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
        <Text style={styles.emptySubtitle}>Semua riwayat medis Anda yang tercatat akan muncul di sini.</Text>
    </View>
);

// Komponen untuk loading indicator
const LoadingIndicator = () => (
     <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat riwayat...</Text>
    </View>
);

export default function RiwayatScreen() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRecords = async () => {
        setIsLoading(true);
        setError('');
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
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Gagal mengambil data riwayat medis.');
            }
            const data = await response.json();
            const sortedData = (data || []).sort((a: MedicalRecord, b: MedicalRecord) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setRecords(sortedData);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('Terjadi kesalahan tidak diketahui.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecords();
        }, [])
    );

    const renderItem = ({ item }: { item: MedicalRecord }) => {
        const recordType = getRecordType(item.diagnosis);
        const recordDate = new Date(item.created_at);
        const formattedDate = recordDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = recordDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineLine} />
                    <View style={styles.iconCircle}>
                        <Feather name={recordType.icon} size={22} color="#007AFF" />
                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.diagnosis}</Text>
                        <View style={[styles.badge, { backgroundColor: recordType.color }]}>
                            <Text style={styles.badgeText}>{recordType.tag}</Text>
                        </View>
                    </View>
                    <View style={styles.cardMetaContainer}>
                         <Feather name="calendar" size={14} color="#666" />
                         <Text style={styles.cardMetaText}>{formattedDate} • {formattedTime}</Text>
                    </View>
                    <Text style={styles.cardContent}>{item.notes}</Text>
                    {item.attachment_cid && (
                        <TouchableOpacity 
                            style={styles.attachmentButton}
                            onPress={() => Linking.openURL(`${API_URL}/ipfs/${item.attachment_cid}`)}
                        >
                            <Feather name="paperclip" size={16} color="#007AFF" />
                            <Text style={styles.attachmentText}>Lihat Lampiran</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.cardFooter}>
                        <Feather name="user-check" size={14} color="#666" />
                        <Text style={styles.cardDoctor}>Dokter: {item.doctor_name}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) return <LoadingIndicator />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
                    <View>
                        <Text style={styles.appName}>RekamedChain</Text>
                        <Text style={styles.appSubtitle}>Riwayat Rekam Medis</Text>
                    </View>
                </View>
            </View>
            
            <FlatList
                data={records}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<EmptyState />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // --- Layout & Global ---
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', textAlign: 'center' },
    
    // --- Header ---
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
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
    logo: {
        width: 36,
        height: 36,
        marginRight: 12,
        resizeMode: 'contain',
    },
    headerTitle: { 
        fontSize: 24,
        fontWeight: 'bold', 
        color: '#111' 
    },

    // --- Timeline ---
    timelineItem: { flexDirection: 'row', gap: 15, marginBottom: 5 },
    timelineIconContainer: { alignItems: 'center', position: 'relative' },
    timelineLine: { position: 'absolute', top: 0, bottom: 0, width: 2.5, backgroundColor: '#e0eafc' },
    iconCircle: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: '#e0eafc', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1,
        marginTop: 4,
    },
    
    // --- Card ---
    card: { 
        flex: 1, 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 20, 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#222', flexShrink: 1, marginRight: 10 },
    cardMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardMetaText: { fontSize: 13, color: '#666', marginLeft: 6 },
    cardContent: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 16 },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        marginTop: 4
    },
    cardDoctor: { fontSize: 13, color: '#666', marginLeft: 6 },
    
    // --- Badge ---
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#007AFF'},
    
    // --- Attachment Button ---
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef6ff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16
    },
    attachmentText: {
        color: '#007AFF',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },

    // --- Empty State ---
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#333',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20
    },
});