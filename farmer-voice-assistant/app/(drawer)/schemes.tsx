import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';

type Scheme = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  eligibility: {
    crops?: string[];
    minLandSize?: number;
    maxLandSize?: number;
    regions?: string[];
    roles?: Array<'farmer' | 'worker' | 'buyer' | 'admin'>;
  };
  applyLink?: string;
  language?: string;
  updatedAt: string;
};

const DUMMY_SCHEMES: Scheme[] = [
  {
    id: 's1',
    title: 'PM-KISAN (Income Support Scheme)',
    description: 'Provides income support to all farmer families across the country.',
    benefits: ['₹6,000 per year in three equal installments'],
    eligibility: { roles: ['farmer'] },
    applyLink: 'https://pmkisan.gov.in/',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 's2',
    title: 'Subsidy for Drip Irrigation',
    description: 'Subsidy for installation of micro-irrigation systems to save water.',
    benefits: ['Up to 55% subsidy for small/marginal farmers'],
    eligibility: { crops: ['Vegetables', 'Cotton', 'Sugarcane'], regions: ['Tamil Nadu'] },
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 's3',
    title: 'Wheat MSP Procurement Support',
    description: 'Minimum Support Price procurement for wheat during rabi season.',
    benefits: ['Guaranteed MSP at government centers'],
    eligibility: { crops: ['Wheat'], regions: ['Punjab', 'Haryana', 'UP'] },
    updatedAt: '2024-01-18T00:00:00Z',
  },
];

export default function SchemesScreen() {
  const navigation = useNavigation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filtered, setFiltered] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [profile, setProfile] = useState({
    role: 'farmer',
    crop: 'Wheat',
    landSize: 2.0,
    region: 'Tamil Nadu',
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schemes, profile, query]);

  const fetchSchemes = async () => {
    try {
      // Placeholder: load from backend when available
      const saved = await AsyncStorage.getItem('govSchemes');
      if (saved) {
        setSchemes(JSON.parse(saved));
      } else {
        setSchemes(DUMMY_SCHEMES);
      }
    } catch (e) {
      setSchemes(DUMMY_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const res = schemes.filter((s) => {
      const matchesRole = !s.eligibility?.roles || s.eligibility.roles.includes(profile.role as any);
      const matchesCrop = !s.eligibility?.crops || s.eligibility.crops.includes(profile.crop);
      const matchesRegion = !s.eligibility?.regions || s.eligibility.regions.includes(profile.region);
      const matchesQuery = !query.trim() ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase());
      const matchesLand = (!s.eligibility?.minLandSize || profile.landSize >= s.eligibility.minLandSize) &&
        (!s.eligibility?.maxLandSize || profile.landSize <= s.eligibility.maxLandSize);
      return matchesRole && matchesCrop && matchesRegion && matchesLand && matchesQuery;
    });
    setFiltered(res);
  };

  const renderScheme = ({ item }: { item: Scheme }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <View style={styles.benefits}>
        {item.benefits.map((b, i) => (
          <Text key={i} style={styles.benefit}>• {b}</Text>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.updated}>Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
        {item.applyLink && (
          <TouchableOpacity style={styles.applyBtn} onPress={() => Alert.alert('Open Link', item.applyLink!)}>
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#43A047" />
        <Text style={styles.loadingText}>Loading Schemes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any)?.openDrawer?.()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏛️ Schemes & Subsidies</Text>
      </View>

      <View style={styles.filterBar}>
        <TextInput
          style={styles.search}
          placeholder="Search schemes..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.filterChip} onPress={() => setProfile({ ...profile, role: profile.role === 'farmer' ? 'worker' : 'farmer' })}>
          <Text style={styles.chipText}>{profile.role}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setProfile({ ...profile, crop: profile.crop === 'Wheat' ? 'Rice' : 'Wheat' })}>
          <Text style={styles.chipText}>{profile.crop}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setProfile({ ...profile, region: profile.region === 'Tamil Nadu' ? 'Punjab' : 'Tamil Nadu' })}>
          <Text style={styles.chipText}>{profile.region}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderScheme}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF2' },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6FFF2' },
  loadingText: { marginTop: 8, color: '#333', fontSize: 16 },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  search: { flex: 1, padding: 10, fontSize: 16, color: '#333' },
  filterChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  chipText: { color: '#2E7D32', fontWeight: '600' },
  list: { padding: 16, paddingTop: 0 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  benefits: { marginBottom: 8 },
  benefit: { fontSize: 14, color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  updated: { fontSize: 12, color: '#666' },
  applyBtn: { backgroundColor: '#2E7D32', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  applyText: { color: '#fff', fontWeight: 'bold' },
});

