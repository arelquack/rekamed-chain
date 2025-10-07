import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import SuccessModal from '../components/SuccessModal';
import { authStyles as styles } from './authStyles';

// GANTI URL NGROK SESUAI TERMINAL
const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
      if (!response.ok) throw new Error(data.message || 'Gagal melakukan registrasi.');
      await AsyncStorage.setItem('private_key', data.private_key);
      setModalVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      Alert.alert('Registrasi Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>RekamedChain</Text>
            <Text style={styles.subtitle}>Daftar Akun Baru</Text>
          </View>

          {/* FORM */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Personal</Text>
            
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nomor Telepon"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Alamat Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.icon}>
                <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.ktpButton}
              onPress={() => Alert.alert('Fitur Segera Hadir', 'Verifikasi e-KTP akan diimplementasikan.')}
            >
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.ktpButtonText}>Verifikasi e-KTP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>
              <Text style={styles.primaryButtonText}>{isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerText}>
              Sudah punya akun? <Text style={{fontWeight: 'bold'}}>Masuk di sini</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL SUKSES */}
      <SuccessModal 
        visible={modalVisible}
        onClose={handleModalClose}
        title="Registrasi Berhasil!"
        message="Akun Anda berhasil dibuat. Kunci digital pribadi Anda telah disimpan di perangkat ini."
      />
    </SafeAreaView>
  );
}