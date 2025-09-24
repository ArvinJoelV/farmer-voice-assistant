import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { setProfile, setOnboarded, UserProfile } from '../../services/auth';

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('farmer');
  const [region, setRegion] = useState('');
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares'>('acres');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!name || !region) { Alert.alert('Missing', 'Please fill your name and region'); return; }
    setLoading(true);
    const profile: UserProfile = {
      name,
      role,
      region,
      landSize: landSize ? parseFloat(landSize) : undefined,
      landUnit,
      firstLogin: false,
    };
    await setProfile(profile);
    await setOnboarded(true);
    router.replace('/(drawer)');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👋 Welcome</Text>
        <Text style={styles.subtitle}>Tell us a bit about you to personalize advice</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#999" value={name} onChangeText={setName} />

        <Text style={styles.label}>Role</Text>
        <View style={styles.row}>
          {(['farmer','worker','buyer'] as const).map(r => (
            <TouchableOpacity key={r} style={[styles.roleBtn, role===r && styles.roleActive]} onPress={() => setRole(r)}>
              <Text style={[styles.roleText, role===r && styles.roleTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Region (State/District)</Text>
        <TextInput style={styles.input} placeholder="e.g., Thanjavur, Tamil Nadu" placeholderTextColor="#999" value={region} onChangeText={setRegion} />

        <Text style={styles.label}>Land Size</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="2.5" placeholderTextColor="#999" keyboardType="numeric" value={landSize} onChangeText={setLandSize} />
          <TouchableOpacity style={styles.unitBtn} onPress={() => setLandUnit(landUnit==='acres'?'hectares':'acres')}>
            <Text style={styles.unitText}>{landUnit}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Preferred Language</Text>
        <View style={styles.row}>
          {(['hi','ta','te','kn','mr','bn','en'] as const).map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, language===l && styles.langActive]} onPress={() => setLanguage(l)}>
              <Text style={[styles.langText, language===l && styles.langTextActive]}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primary} onPress={onContinue} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Continue</Text>}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Safety: Fertilizer recommendations are indicative. Consult local extension officers.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF2', padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 12, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', gap: 8 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  roleActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  roleText: { color: '#666', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  unitBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  unitText: { color: '#fff', fontWeight: 'bold' },
  langBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  langActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  langText: { color: '#333', fontWeight: '600' },
  langTextActive: { color: '#2E7D32' },
  primary: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: 'bold' },
  disclaimer: { marginTop: 12, color: '#888', fontSize: 12, textAlign: 'center' },
});


