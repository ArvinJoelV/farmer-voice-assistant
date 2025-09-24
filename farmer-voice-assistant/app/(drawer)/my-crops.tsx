import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';

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

type CropStage = { name: string; duration: number; actions: string[]; fertilizers: string[]; irrigation: string; pest: string[] };

const CYCLE: Record<string, CropStage[]> = {
  Wheat: [
    { name: 'Sowing', duration: 7, actions: ['Prepare seed bed', 'Basal fertilizer'], fertilizers: ['DAP 50kg/acre', 'Urea 25kg/acre'], irrigation: 'Light irrigation after sowing', pest: ['Seed treatment'] },
    { name: 'Germination', duration: 10, actions: ['Monitor germination', 'Check moisture'], fertilizers: [], irrigation: 'Light if needed', pest: ['Watch damping off'] },
    { name: 'Tillering', duration: 35, actions: ['Top dress urea', 'Weed control'], fertilizers: ['Urea 50kg/acre'], irrigation: 'Every 10-12 days', pest: ['Monitor aphids'] },
    { name: 'Jointing', duration: 25, actions: ['Second top dressing'], fertilizers: ['Urea 25kg/acre'], irrigation: 'Increase frequency', pest: ['Watch rust'] },
    { name: 'Flowering', duration: 15, actions: ['Reduce irrigation'], fertilizers: [], irrigation: 'Reduce to prevent lodging', pest: ['Watch head blast'] },
    { name: 'Harvesting', duration: 10, actions: ['Harvest 20-25% moisture'], fertilizers: [], irrigation: 'Stop irrigation', pest: ['Storage pests'] },
  ],
  Rice: [
    { name: 'Nursery', duration: 25, actions: ['Prepare nursery', 'Sow pre-germinated'], fertilizers: ['Compost 5kg/sqm'], irrigation: 'Keep moist', pest: ['Blast watch'] },
    { name: 'Transplanting', duration: 5, actions: ['Transplant 20-25 day seedlings'], fertilizers: ['Basal DAP 50 + Urea 25kg/acre'], irrigation: '2-3cm water', pest: ['Stem borer watch'] },
    { name: 'Tillering', duration: 40, actions: ['Top dress urea', 'Weed control'], fertilizers: ['Urea 50kg/acre'], irrigation: '5-7cm water', pest: ['Leaf folder watch'] },
    { name: 'Panicle Initiation', duration: 25, actions: ['Second top dressing'], fertilizers: ['Urea 25kg/acre'], irrigation: '5-7cm water', pest: ['BPH watch'] },
    { name: 'Flowering & Grain', duration: 35, actions: ['Control irrigation'], fertilizers: [], irrigation: 'Gradually reduce', pest: ['Grain borer watch'] },
    { name: 'Harvesting', duration: 15, actions: ['Harvest at 80% maturity'], fertilizers: [], irrigation: 'Stop 7-10 days before', pest: ['Storage pests'] },
  ],
};

export default function MyCrops() {
  const navigation = useNavigation();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Crop | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', variety: '', sowingDate: '', landSize: '', landUnit: 'acres' as 'acres' | 'hectares', location: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const saved = await AsyncStorage.getItem('farmerCrops');
    if (saved) setCrops(JSON.parse(saved));
    else setCrops([
      { id: '1', name: 'Wheat', variety: 'HD-2967', sowingDate: '2025-01-10', landSize: 2.5, landUnit: 'acres', location: 'TN', currentStage: 'Tillering', nextAction: 'Top dress urea 50kg/acre', nextActionDate: '2025-02-18', weatherAlerts: ['Heavy rain: Do not irrigate today.'] },
    ]);
  };

  const save = async (list: Crop[]) => AsyncStorage.setItem('farmerCrops', JSON.stringify(list));

  const computeStage = (name: string, sowingDate: string) => {
    const stages = CYCLE[name] || [];
    const start = new Date(sowingDate).getTime();
    const days = Math.floor((Date.now() - start) / 86400000);
    let acc = 0; let current = stages[0] || { name: 'Unknown', duration: 0, actions: ['Monitor crop'], fertilizers: [], irrigation: 'As needed', pest: [] };
    for (const s of stages) { acc += s.duration; if (days <= acc) { current = s; break; } }
    const nextDate = new Date(start + acc * 86400000).toISOString().slice(0, 10);
    return { stage: current.name, nextAction: current.actions[0] || 'Monitor crop', nextDate };
  };

  const addCrop = async () => {
    if (!form.name || !form.sowingDate || !form.landSize) { Alert.alert('Missing', 'Fill crop name, sowing date, land size'); return; }
    setSaving(true);
    const { stage, nextAction, nextDate } = computeStage(form.name, form.sowingDate);
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
    setSaving(false);
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
    const stages = CYCLE[detail.name] || [];
    const base = new Date(detail.sowingDate).getTime();
    let day = 0;
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={styles.detailTitle}>{detail.name} {detail.variety ? `• ${detail.variety}` : ''}</Text>
        <Text style={styles.detailSub}>{detail.landSize} {detail.landUnit} • {detail.location || '—'}</Text>
        <Text style={styles.sectionTitle}>🌱 Crop Calendar</Text>
        {stages.map((s, i) => { const start = day + 1; day += s.duration; const end = day; const endDate = new Date(base + day * 86400000).toLocaleDateString(); return (
          <View key={i} style={styles.stageCard}>
            <View style={styles.rowBetween}><Text style={styles.stageName}>{s.name} ({s.duration}d)</Text><Text style={styles.stageDate}>Day {start}-{end}</Text></View>
            <Text style={styles.label}>Actions</Text>
            {s.actions.map((a, idx) => <Text key={idx} style={styles.item}>• {a}</Text>)}
            {!!s.fertilizers.length && (<><Text style={styles.label}>Fertilizers</Text>{s.fertilizers.map((f, idx) => <Text key={idx} style={styles.item}>• {f}</Text>)}</>)}
            <Text style={styles.label}>Irrigation</Text>
            <Text style={styles.item}>• {s.irrigation}</Text>
            {!!s.pest.length && (<><Text style={styles.label}>Pest Management</Text>{s.pest.map((p, idx) => <Text key={idx} style={styles.item}>• {p}</Text>)}</>)}
            <Text style={styles.nextDueSmall}>Target by: {endDate}</Text>
          </View>
        ); })}
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>
      {crops.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={64} color="#BBB" />
          <Text style={styles.emptyTitle}>No crops yet</Text>
          <Text style={styles.emptyText}>Add your crops to get stage-wise advisory and weather alerts.</Text>
          <TouchableOpacity style={styles.primary} onPress={() => setAddOpen(true)}><Text style={styles.primaryText}>Add Crop</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList data={crops} renderItem={renderItem} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16 }} />
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  stageCard: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  stageName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  stageDate: { fontSize: 12, color: '#666' },
  label: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 6 },
  item: { fontSize: 13, color: '#555', marginTop: 2 },
  nextDueSmall: { fontSize: 12, color: '#FF9800', marginTop: 6 },
});


