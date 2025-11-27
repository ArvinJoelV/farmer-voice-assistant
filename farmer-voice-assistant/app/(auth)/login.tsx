import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { loginWithOtp, setProfile, requestOtp } from '../../services/auth';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const onRequestOtp = async () => {
    if (!phone) { 
      Alert.alert('Missing', 'Please enter your phone number'); 
      return; 
    }
    
    setOtpLoading(true);
    try {
      const result = await requestOtp(phone);
      setOtpSent(true);
      Alert.alert(
        'OTP Sent', 
        `OTP has been sent to ${phone}. For development, use: ${result.dev_code || 'Check console'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  const onLogin = async () => {
    if (!phone || !otp) { 
      Alert.alert('Missing', 'Enter phone and OTP'); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await loginWithOtp(phone, otp);
      if (res.firstLogin) {
        await setProfile({ phone, firstLogin: true, role: 'farmer' });
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(drawer)');
      }
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>🌱 CROPWISE</Text><Text style={styles.subtitle}>Welcome back</Text></View>
      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="phone-pad" 
          placeholder="+91 9xxxxxxxxx" 
          placeholderTextColor="#999" 
          value={phone} 
          onChangeText={setPhone} 
        />
        
        {!otpSent ? (
          <TouchableOpacity style={styles.otpButton} onPress={onRequestOtp} disabled={otpLoading}>
            {otpLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.otpButtonText}>Send OTP</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.label}>OTP</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="number-pad" 
              placeholder="6-digit" 
              placeholderTextColor="#999" 
              value={otp} 
              onChangeText={setOtp} 
            />
            <TouchableOpacity style={styles.resendButton} onPress={onRequestOtp} disabled={otpLoading}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}
        
        {otpSent && (
          <TouchableOpacity style={styles.primary} onPress={onLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Login</Text>}
          </TouchableOpacity>
        )}
        
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>New here? Create account</Text>
          </TouchableOpacity>
        </Link>
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
  otpButton: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  otpButtonText: { color: '#fff', fontWeight: 'bold' },
  resendButton: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  resendButtonText: { color: '#2E7D32', fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 12 },
  linkText: { color: '#2E7D32', fontWeight: '600' },
});


