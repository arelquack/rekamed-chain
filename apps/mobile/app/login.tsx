// apps/mobile/app/login.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

// GANTI DENGAN ALAMAT IP LOKAL KOMPUTERMU
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev'; // Contoh: ganti dengan IP-mu

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email atau password salah.');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);
      
      router.replace('/dashboard');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Feather name="shield" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>RekamedChain</Text>
          <Text style={styles.subtitle}>Selamat Datang Kembali</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Alamat Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.primaryButtonText}>{isLoading ? 'Masuk...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.footerText}>Belum punya akun? <Text style={{fontWeight: 'bold'}}>Daftar di sini</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { width: '100%', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 16, color: '#666' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, width: '100%', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, backgroundColor: '#f9f9f9' },
  icon: { padding: 10 },
  input: { flex: 1, height: 48, paddingHorizontal: 10, fontSize: 16 },
  primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footerText: { textAlign: 'center', color: '#666' },
});