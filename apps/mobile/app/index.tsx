import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
    // Langsung alihkan pengguna ke halaman login saat aplikasi dibuka
    return <Redirect href="/login" />;
}