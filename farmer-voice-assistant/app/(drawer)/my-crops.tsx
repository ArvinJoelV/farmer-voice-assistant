import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from 'expo-router';
import { getCropInfo, CropInfo, CropStage } from '../../services/cropInfo';

type Crop = {
  id: string;
  name: string;
  variety?: string;
  sowingDate: string;
  landSize: number;
  landUnit: 'acres' | 'hectares';
  location?: string;
  currentStage: string;
  nextAction: string;
  nextActionDate: string;
  weatherAlerts: string[];
};

// Crop stage cache to avoid repeated API calls
const cropInfoCache: Record<string, CropInfo> = {};

export default function MyCrops() {
  const navigation = useNavigation();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Crop | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cropInfoMap, setCropInfoMap] = useState<Record<string, CropInfo>>({});

  const [form, setForm] = useState({ name: '', variety: '', sowingDate: '', landSize: '', landUnit: 'acres' as 'acres' | 'hectares', location: '' });

  useEffect(() => { 
    load(); 
  }, []);

  // Refresh crop stages when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const currentCrops = crops.length > 0 ? crops : JSON.parse(await AsyncStorage.getItem('farmerCrops') || '[]');
        if (currentCrops.length > 0) {
          await refreshCropStages();
        }
      };
      refresh();
    }, [crops.length])
  );

  const load = async () => {
    const saved = await AsyncStorage.getItem('farmerCrops');
    if (saved) {
      const loadedCrops = JSON.parse(saved);
      setCrops(loadedCrops);
      // Refresh stages for loaded crops
      if (loadedCrops.length > 0) {
        setTimeout(() => refreshCropStages(), 100);
      }
    } else {
      setCrops([
        { id: '1', name: 'Wheat', variety: 'HD-2967', sowingDate: '2025-01-10', landSize: 2.5, landUnit: 'acres', location: 'TN', currentStage: 'Tillering', nextAction: 'Top dress urea 50kg/acre', nextActionDate: '2025-02-18', weatherAlerts: ['Heavy rain: Do not irrigate today.'] },
      ]);
    }
  };

  const save = async (list: Crop[]) => AsyncStorage.setItem('farmerCrops', JSON.stringify(list));

  /**
   * Fetch crop information from backend API
   */
  const fetchCropInfo = async (cropName: string): Promise<CropInfo | null> => {
    try {
      // Check cache first
      const cacheKey = cropName.toLowerCase();
      if (cropInfoCache[cacheKey]) {
        return cropInfoCache[cacheKey];
      }

      // Fetch from API
      const info = await getCropInfo(cropName);
      cropInfoCache[cacheKey] = info;
      return info;
    } catch (error) {
      console.error(`Error fetching crop info for ${cropName}:`, error);
      return null;
    }
  };

  /**
   * Refresh crop stages for all crops
   */
  const refreshCropStages = async () => {
    const currentCrops = crops.length > 0 ? crops : JSON.parse(await AsyncStorage.getItem('farmerCrops') || '[]');
    if (currentCrops.length === 0) {
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    const updatedCrops: Crop[] = [];
    const infoMap: Record<string, CropInfo> = {};

    for (const crop of currentCrops) {
      try {
        const cropInfo = await fetchCropInfo(crop.name);
        if (cropInfo) {
          infoMap[crop.name.toLowerCase()] = cropInfo;
          const { stage, nextAction, nextDate } = computeStage(cropInfo, crop.sowingDate);
          updatedCrops.push({
            ...crop,
            currentStage: stage,
            nextAction,
            nextActionDate: nextDate,
          });
        } else {
          // Fallback if API fails - keep existing data
          updatedCrops.push(crop);
        }
      } catch (error) {
        console.error(`Error refreshing crop ${crop.name}:`, error);
        // Keep existing crop data if refresh fails
        updatedCrops.push(crop);
      }
    }

    setCrops(updatedCrops);
    setCropInfoMap(infoMap);
    await save(updatedCrops);
    setRefreshing(false);
  };

  /**
   * Compute current stage based on crop info and sowing date
   */
  const computeStage = (cropInfo: CropInfo, sowingDate: string) => {
    const stages = cropInfo.stages || [];
    const start = new Date(sowingDate).getTime();
    const days = Math.floor((Date.now() - start) / 86400000);
    
    if (days < 0) {
      // Crop not yet sown
      return { 
        stage: 'Not Sown', 
        nextAction: 'Prepare for sowing', 
        nextDate: sowingDate 
      };
    }

    let acc = 0;
    let current = stages[0] || { 
      name: 'Unknown', 
      duration: 0, 
      actions: ['Monitor crop'], 
      fertilizers: [], 
      irrigation: 'As needed', 
      pest: [] 
    };

    for (const s of stages) {
      acc += s.duration;
      if (days <= acc) {
        current = s;
        break;
      }
    }

    // If past all stages, crop is ready for harvest
    if (days > acc) {
      current = stages[stages.length - 1] || current;
      return {
        stage: 'Ready for Harvest',
        nextAction: 'Harvest crop',
        nextDate: new Date(start + acc * 86400000).toISOString().slice(0, 10)
      };
    }

    const nextDate = new Date(start + acc * 86400000).toISOString().slice(0, 10);
    return { 
      stage: current.name, 
      nextAction: current.actions[0] || 'Monitor crop', 
      nextDate 
    };
  };

  const addCrop = async () => {
    if (!form.name || !form.sowingDate || !form.landSize) { 
      Alert.alert('Missing', 'Fill crop name, sowing date, land size'); 
      return; 
    }
    
    setSaving(true);
    setLoading(true);

    try {
      // Fetch crop info from API
      const cropInfo = await fetchCropInfo(form.name);
      
      let stage = 'Unknown';
      let nextAction = 'Monitor crop';
      let nextDate = form.sowingDate;

      if (cropInfo) {
        const computed = computeStage(cropInfo, form.sowingDate);
        stage = computed.stage;
        nextAction = computed.nextAction;
        nextDate = computed.nextDate;
        
        // Store crop info in map
        setCropInfoMap(prev => ({
          ...prev,
          [form.name.toLowerCase()]: cropInfo
        }));
      } else {
        // Fallback for unknown crops
        const start = new Date(form.sowingDate).getTime();
        const days = Math.floor((Date.now() - start) / 86400000);
        if (days < 0) {
          stage = 'Not Sown';
          nextAction = 'Prepare for sowing';
        } else if (days < 30) {
          stage = 'Early Growth';
          nextAction = 'Monitor growth and apply fertilizers';
        } else if (days < 90) {
          stage = 'Vegetative Growth';
          nextAction = 'Continue monitoring and irrigation';
        } else {
          stage = 'Maturation';
          nextAction = 'Prepare for harvest';
        }
      }

      const crop: Crop = {
        id: Date.now().toString(),
        name: form.name,
        variety: form.variety,
        sowingDate: form.sowingDate,
        landSize: parseFloat(form.landSize),
        landUnit: form.landUnit,
        location: form.location,
        currentStage: stage,
        nextAction,
        nextActionDate: nextDate,
        weatherAlerts: [],
      };
      
      const list = [crop, ...crops];
      setCrops(list);
      await save(list);
      setAddOpen(false);
      setForm({ name: '', variety: '', sowingDate: '', landSize: '', landUnit: 'acres', location: '' });
    } catch (error) {
      console.error('Error adding crop:', error);
      Alert.alert('Error', 'Failed to add crop. Please try again.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const remove = (id: string) => Alert.alert('Delete', 'Remove this crop?', [ { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { const list = crops.filter(c => c.id !== id); setCrops(list); await save(list); } } ]);

  const renderItem = ({ item }: { item: Crop }) => (
    <TouchableOpacity style={styles.card} onPress={() => setDetail(item)}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {!!item.variety && <Text style={styles.variety}>{item.variety}</Text>}
        </View>
        <TouchableOpacity onPress={() => remove(item.id)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#E53935" /></TouchableOpacity>
      </View>
      <Text style={styles.meta}>📍 {item.location || '—'}</Text>
      <Text style={styles.meta}>📅 Sown: {new Date(item.sowingDate).toLocaleDateString()} • 🌾 {item.landSize} {item.landUnit}</Text>
      <View style={styles.stageBox}>
        <Text style={styles.stageTitle}>Current Stage</Text>
        <Text style={styles.stageText}>{item.currentStage}</Text>
      </View>
      <View style={styles.nextBox}>
        <Text style={styles.nextTitle}>Next Action</Text>
        <Text style={styles.nextText}>{item.nextAction}</Text>
        <Text style={styles.nextDue}>Due: {new Date(item.nextActionDate).toLocaleDateString()}</Text>
      </View>
      {!!item.weatherAlerts.length && (
        <View style={styles.alertBox}><Ionicons name="warning" size={16} color="#FF9800" /><Text style={styles.alertText}>{item.weatherAlerts[0]}</Text></View>
      )}
    </TouchableOpacity>
  );

  const renderDetail = () => {
    if (!detail) return null;
    
    const cropInfo = cropInfoMap[detail.name.toLowerCase()];
    const stages = cropInfo?.stages || [];
    const base = new Date(detail.sowingDate).getTime();
    let day = 0;

    // If no crop info loaded, try to fetch it
    if (!cropInfo && stages.length === 0) {
      fetchCropInfo(detail.name).then(info => {
        if (info) {
          setCropInfoMap(prev => ({
            ...prev,
            [detail.name.toLowerCase()]: info
          }));
        }
      });
    }

    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={styles.detailTitle}>{detail.name} {detail.variety ? `• ${detail.variety}` : ''}</Text>
        <Text style={styles.detailSub}>{detail.landSize} {detail.landUnit} • {detail.location || '—'}</Text>
        
        {cropInfo?.description && (
          <Text style={styles.description}>{cropInfo.description}</Text>
        )}
        
        <Text style={styles.sectionTitle}>🌱 Crop Calendar</Text>
        
        {stages.length > 0 ? (
          stages.map((s, i) => { 
            const start = day + 1; 
            day += s.duration; 
            const end = day; 
            const endDate = new Date(base + day * 86400000).toLocaleDateString(); 
            return (
              <View key={i} style={styles.stageCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.stageName}>{s.name} ({s.duration}d)</Text>
                  <Text style={styles.stageDate}>Day {start}-{end}</Text>
                </View>
                {s.description && (
                  <Text style={styles.stageDescription}>{s.description}</Text>
                )}
                <Text style={styles.label}>Actions</Text>
                {s.actions.map((a, idx) => <Text key={idx} style={styles.item}>• {a}</Text>)}
                {!!s.fertilizers.length && (
                  <>
                    <Text style={styles.label}>Fertilizers</Text>
                    {s.fertilizers.map((f, idx) => <Text key={idx} style={styles.item}>• {f}</Text>)}
                  </>
                )}
                <Text style={styles.label}>Irrigation</Text>
                <Text style={styles.item}>• {s.irrigation}</Text>
                {!!s.pest.length && (
                  <>
                    <Text style={styles.label}>Pest Management</Text>
                    {s.pest.map((p, idx) => <Text key={idx} style={styles.item}>• {p}</Text>)}
                  </>
                )}
                <Text style={styles.nextDueSmall}>Target by: {endDate}</Text>
              </View>
            ); 
          })
        ) : (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading crop calendar...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => (navigation as any)?.openDrawer?.()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌾 My Crops</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.addBtn} onPress={refreshCropStages} disabled={refreshing}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {crops.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={64} color="#BBB" />
          <Text style={styles.emptyTitle}>No crops yet</Text>
          <Text style={styles.emptyText}>Add your crops to get stage-wise advisory and weather alerts.</Text>
          <TouchableOpacity style={styles.primary} onPress={() => setAddOpen(true)}><Text style={styles.primaryText}>Add Crop</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={crops} 
          renderItem={renderItem} 
          keyExtractor={(i) => i.id} 
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshCropStages}
              colors={['#2E7D32']}
            />
          }
        />
      )}

      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Add Crop</Text><TouchableOpacity onPress={() => setAddOpen(false)}><Ionicons name="close" size={22} color="#333" /></TouchableOpacity></View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.inputLabel}>Crop Name *</Text>
            <TextInput style={styles.input} placeholder="e.g., Wheat, Rice" placeholderTextColor="#999" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <Text style={styles.inputLabel}>Variety</Text>
            <TextInput style={styles.input} placeholder="e.g., HD-2967" placeholderTextColor="#999" value={form.variety} onChangeText={(t) => setForm({ ...form, variety: t })} />
            <Text style={styles.inputLabel}>Sowing Date (YYYY-MM-DD) *</Text>
            <TextInput style={styles.input} placeholder="2025-01-10" placeholderTextColor="#999" value={form.sowingDate} onChangeText={(t) => setForm({ ...form, sowingDate: t })} />
            <Text style={styles.inputLabel}>Land Size *</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="2.5" placeholderTextColor="#999" keyboardType="numeric" value={form.landSize} onChangeText={(t) => setForm({ ...form, landSize: t })} />
              <TouchableOpacity style={styles.unitBtn} onPress={() => setForm({ ...form, landUnit: form.landUnit === 'acres' ? 'hectares' : 'acres' })}><Text style={styles.unitText}>{form.landUnit}</Text></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput style={styles.input} placeholder="Village, District" placeholderTextColor="#999" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancel} onPress={() => setAddOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={addCrop} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>Save</Text>}</TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!detail} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Crop Details</Text><TouchableOpacity onPress={() => setDetail(null)}><Ionicons name="close" size={22} color="#333" /></TouchableOpacity></View>
          {renderDetail()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF2' },
  header: { backgroundColor: '#2E7D32', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 18 },
  menuBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: 'bold' },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 16 },
  primary: { backgroundColor: '#2E7D32', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22 },
  primaryText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: 6 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  variety: { fontSize: 13, color: '#666', marginTop: 2 },
  meta: { fontSize: 14, color: '#555', marginTop: 2 },
  stageBox: { backgroundColor: '#E8F5E9', padding: 8, borderRadius: 8, marginTop: 8 },
  stageTitle: { fontSize: 12, color: '#666', fontWeight: '600' },
  stageText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
  nextBox: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 8, marginTop: 8 },
  nextTitle: { fontSize: 12, color: '#666', fontWeight: '600' },
  nextText: { fontSize: 14, color: '#4E342E', lineHeight: 20 },
  nextDue: { fontSize: 12, color: '#FF9800', marginTop: 4, fontWeight: '600' },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 8, borderRadius: 8, marginTop: 8 },
  alertText: { marginLeft: 6, color: '#FF9800', fontSize: 12 },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12 },
  cancel: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontSize: 16 },
  save: { flex: 1, backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  inputLabel: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8 },
  unitText: { color: '#fff', fontWeight: 'bold' },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  detailSub: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 12 },
  description: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 12, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  loadingCard: { padding: 20, alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 12, marginTop: 10 },
  loadingText: { marginTop: 8, color: '#666', fontSize: 14 },
  stageDescription: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 8 },
  stageCard: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  stageName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  stageDate: { fontSize: 12, color: '#666' },
  label: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 6 },
  item: { fontSize: 13, color: '#555', marginTop: 2 },
  nextDueSmall: { fontSize: 12, color: '#FF9800', marginTop: 6 },
});


