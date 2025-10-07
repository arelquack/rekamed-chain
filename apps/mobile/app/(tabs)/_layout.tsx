// apps/mobile/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
      }}>
      <Tabs.Screen
        name="index" // Ini akan menunjuk ke file index.tsx (dashboard kita)
        options={{
          title: 'Dasbor',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          headerShown: false, // Kita akan buat header sendiri
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="izin"
        options={{
          title: 'Izin Akses',
          tabBarIcon: ({ color }) => <Feather name="shield" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log Akses',
          tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}