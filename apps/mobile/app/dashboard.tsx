import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PASTIKAN URL NGROK INI SESUAI DENGAN YANG ADA DI TERMINAL LO
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // <-- GANTI DENGAN URL NGROK-MU

// Definisikan tipe data untuk rekam medis
interface MedicalRecord {
    id: string;
    doctor_name: string;
    diagnosis: string;
    notes: string;
    created_at: string;
}

export default function DashboardScreen() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            setError('Token tidak ditemukan, silahkan login ulang.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/records`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            });

            if (!response.ok) {
            throw new Error('Gagal mengambil data riwayat medis.');
            }

            const data = await response.json();
            setRecords(data);
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

        fetchRecords();
    }, []); // Berjalan sekali saat layar dimuat

    // Komponen untuk merender setiap item di daftar
    const renderItem = ({ item }: { item: MedicalRecord }) => (
        <View style={styles.card}>
        <Text style={styles.diagnosis}>{item.diagnosis}</Text>
        <Text style={styles.notes}>{item.notes}</Text>
        <Text style={styles.meta}>
            Oleh: {item.doctor_name} pada {new Date(item.created_at).toLocaleDateString('id-ID')}
        </Text>
        </View>
    );

    if (isLoading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (error) {
        return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    }

    return (
        <View style={styles.container}>
        {records.length > 0 ? (
            <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            />
        ) : (
            <Text style={styles.centered}>Belum ada riwayat medis.</Text>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    diagnosis: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    notes: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    meta: {
        fontSize: 12,
        color: '#666',
    },
});