import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Halaman Login</Text>
        <Button
            title="Login & Pindah ke Dashboard"
            onPress={() => router.push('/dashboard')}
        />
        </View>
    );
}