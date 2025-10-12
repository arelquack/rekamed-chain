import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardEvent,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import SuccessModal from '../components/SuccessModal';
import { authStyles as styles } from './authStyles';

const API_URL = 'https://5a121f6a66ba.ngrok-free.app';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [extraPadding, setExtraPadding] = useState(new Animated.Value(0));
  const router = useRouter();

  // 🔹 Keyboard listener buat animasi naik/turun
  useEffect(() => {
    const keyboardShow = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      Animated.timing(extraPadding, {
        toValue: 80,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(extraPadding, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  // ✅ validasi sederhana
  const validateInputs = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Nama, email, dan password wajib diisi.');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Peringatan', 'Alamat email tidak valid.');
      return false;
    }
    return true;
  };

  // ✅ cek email sudah terdaftar
  const checkEmailExists = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.exists;
    } catch {
      return false;
    }
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        Alert.alert('Registrasi Gagal', 'Email sudah terdaftar. Silakan gunakan email lain.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'patient',
          phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message?.includes('email') || data.message?.includes('NIP')) {
          throw new Error('Email atau NIP sudah digunakan. Silakan coba lagi.');
        }
        throw new Error(data.message || 'Gagal melakukan registrasi.');
      }

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={{ flex: 1, paddingBottom: extraPadding }}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContainer}
            >
              <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                  <Image
                    source={require('../assets/images/icon.png')}
                    style={styles.logo}
                  />
                  <Text style={styles.title}>RekamedChain</Text>
                  <Text style={styles.subtitle}>Daftar Akun Baru</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Informasi Personal</Text>

                  {/* Name */}
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nama Lengkap"
                      value={name}
                      onChangeText={setName}
                      editable={!isLoading}
                    />
                  </View>

                  {/* Phone */}
                  <View style={styles.inputContainer}>
                    <Feather name="phone" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nomor Telepon"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Alamat Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!isPasswordVisible}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      style={styles.icon}
                      disabled={isLoading}
                    >
                      <Feather
                        name={isPasswordVisible ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* e-KTP Button */}
                  <TouchableOpacity
                    style={styles.ktpButton}
                    onPress={() =>
                      Alert.alert('Fitur Segera Hadir', 'Verifikasi e-KTP akan diimplementasikan.')
                    }
                    disabled={isLoading}
                  >
                    <Ionicons name="camera-outline" size={24} color="#007AFF" />
                    <Text style={styles.ktpButtonText}>Verifikasi e-KTP</Text>
                  </TouchableOpacity>

                  {/* Register Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      isLoading && { backgroundColor: '#9ca3af' },
                    ]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={isLoading ? 1 : 0.7}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Login redirect */}
                <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                  <Text style={styles.footerText}>
                    Sudah punya akun?{' '}
                    <Text style={{ fontWeight: 'bold' }}>Masuk di sini</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal sukses */}
      <SuccessModal
        visible={modalVisible}
        onClose={handleModalClose}
        title="Registrasi Berhasil!"
        message="Akun Anda berhasil dibuat. Kunci digital pribadi Anda telah disimpan di perangkat ini."
      />
    </SafeAreaView>
  );
}