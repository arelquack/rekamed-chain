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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardEvent,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { authStyles as styles } from './authStyles';

const API_URL = 'https://fatigueless-elfrieda-scrimpier.ngrok-free.dev';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extraPadding, setExtraPadding] = useState(new Animated.Value(0));
  const router = useRouter();

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input tidak lengkap', 'Silakan isi email dan password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/patient/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Email atau password salah.');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat login.';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsLoading(false);
    }
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
                  <Text style={styles.subtitle}>Selamat Datang Kembali, Pasien!</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                  {/* Email input */}
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

                  {/* Password input */}
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

                  {/* Login button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      isLoading && { backgroundColor: '#9ca3af' },
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={isLoading ? 1 : 0.7}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Register link */}
                <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
                  <Text style={styles.footerText}>
                    Belum punya akun? <Text style={{ fontWeight: 'bold' }}>Daftar di sini</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
