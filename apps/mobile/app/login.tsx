// apps/mobile/app/login.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email atau password salah.');
      }

      // Jika login berhasil, simpan token & role
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);
      
      // Arahkan ke dashboard
      router.replace('/dashboard');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Selamat Datang!</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={isLoading ? 'Loading...' : 'Login'}
          onPress={handleLogin}
          disabled={isLoading}
        />
        <View style={{ marginVertical: 10 }} />
        <Button
          title="Belum punya akun? Daftar"
          onPress={() => router.push('/register')}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});