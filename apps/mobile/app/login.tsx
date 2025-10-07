import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { authStyles as styles } from './authStyles';

// PASTIKAN URL NGROK INI SESUAI
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      router.replace('/(tabs)'); // Arahkan ke layout tabs (dashboard)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
             <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
            />
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
              <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} />
               <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.icon}>
                  <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
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
    </SafeAreaView>
  );
}