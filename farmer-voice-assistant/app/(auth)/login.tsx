import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { loginWithOtp, setProfile } from '../../services/auth';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!phone || !otp) { Alert.alert('Missing', 'Enter phone and OTP'); return; }
    setLoading(true);
    const res = await loginWithOtp(phone, otp);
    if (res.firstLogin) {
      await setProfile({ phone, firstLogin: true, role: 'farmer' });
      router.replace('/(auth)/onboarding');
    } else {
      router.replace('/(drawer)');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>🌱 CROPWISE</Text><Text style={styles.subtitle}>Welcome back</Text></View>
      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" placeholder="+91 9xxxxxxxxx" placeholderTextColor="#999" value={phone} onChangeText={setPhone} />
        <Text style={styles.label}>OTP</Text>
        <TextInput style={styles.input} keyboardType="number-pad" placeholder="6-digit" placeholderTextColor="#999" value={otp} onChangeText={setOtp} />
        <TouchableOpacity style={styles.primary} onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Login</Text>}
        </TouchableOpacity>
        <Link href="/(auth)/signup" asChild><TouchableOpacity style={styles.link}><Text style={styles.linkText}>New here? Create account</Text></TouchableOpacity></Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF2', padding: 20, paddingTop: 100 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 12, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
  primary: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: 'bold' },
  link: { alignItems: 'center', marginTop: 12 },
  linkText: { color: '#2E7D32', fontWeight: '600' },
});


