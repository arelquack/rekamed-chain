import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="register" options={{ title: 'Registrasi', headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Pasien', headerShown: false }} />
      <Stack.Screen name="consent" options={{ title: 'Manajemen Izin', headerShown: false }} />
      <Stack.Screen name="logaccess" options={{ title: 'Log Akses', headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}