import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Pasien' }} />
      <Stack.Screen name="consent" options={{ title: 'Manajemen Izin' }} />
    </Stack>
  );
}