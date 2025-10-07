import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="register" options={{ title: 'Registrasi' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Pasien' }} />
      <Stack.Screen name="consent" options={{ title: 'Manajemen Izin' }} />
      <Stack.Screen name="logaccess" options={{ title: 'Log Akses' }} />
    </Stack>
  );
}