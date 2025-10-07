// apps/mobile/app/register.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PASTIKAN URL NGROK INI SESUAI
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // <-- GANTI DENGAN URL NGROK-MU

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
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
      
      // Kita coba ekstrak informasi sebanyak mungkin dari error-nya
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
      
      // Tampilkan semua informasi ini di dalam Alert
      Alert.alert('DEBUG: Registrasi Gagal', debugMessage);
      // --- DEBUGGER SELESAI ---

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buat Akun Baru</Text>
      <TextInput style={styles.input} placeholder="Nama Lengkap" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={isLoading ? 'Mendaftarkan...' : 'Daftar'} onPress={handleRegister} disabled={isLoading} />
      <Button title="Sudah punya akun? Login" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, borderRadius: 5 },
});