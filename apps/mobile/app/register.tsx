import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';

// PASTIKAN URL NGROK INI SESUAI
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // <-- GANTI DENGAN URL NGROK-MU

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // State baru untuk nomor telepon
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // NOTE: 'phone' belum dikirim ke backend, perlu penyesuaian di backend nanti
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'patient' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal melakukan registrasi.');
      }

      // SIMPAN KUNCI PRIVAT KE ASYNCSTORAGE
      await AsyncStorage.setItem('private_key', data.private_key);

      Alert.alert('Registrasi Berhasil', 'Akun Anda berhasil dibuat. Silakan login.');
      router.push('/login');

    } catch (error) {
      // --- DEBUGGER DIMULAI DI SINI ---
      let debugMessage = `Terjadi kesalahan yang tidak terduga.`;
      if (error instanceof Error) {
        debugMessage = `
Error Name: 
${error.name}

Error Message: 
${error.message}
---
Full Error (JSON):
${JSON.stringify(error, null, 2)}
        `;
      } else {
        debugMessage = `Terjadi error non-standar: ${JSON.stringify(error, null, 2)}`;
      }
      Alert.alert('DEBUG: Registrasi Gagal', debugMessage);
      // --- DEBUGGER SELESAI ---

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Feather name="shield" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>RekamedChain</Text>
            <Text style={styles.subtitle}>Daftar Akun Baru</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Personal</Text>
            
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Nama Lengkap" value={name} onChangeText={setName} />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Nomor Telepon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Alamat Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity style={styles.ktpButton} onPress={() => Alert.alert('Fitur Segera Hadir', 'Verifikasi e-KTP akan diimplementasikan.')}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.ktpButtonText}>Verifikasi e-KTP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>
              <Text style={styles.primaryButtonText}>{isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerText}>Sudah punya akun? <Text style={{fontWeight: 'bold'}}>Masuk di sini</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { width: '100%', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 16, color: '#666' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, width: '100%', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, color: '#1a202c' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, backgroundColor: '#f9f9f9' },
  icon: { padding: 10 },
  input: { flex: 1, height: 48, paddingHorizontal: 10, fontSize: 16 },
  ktpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#007AFF', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 12, marginBottom: 20 },
  ktpButtonText: { color: '#007AFF', marginLeft: 10, fontWeight: '600', fontSize: 16 },
  primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footerText: { textAlign: 'center', color: '#666' },
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
});