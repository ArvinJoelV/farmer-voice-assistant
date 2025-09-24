import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

type Post = { id: string; type: 'question' | 'tip' | 'update'; title: string; content: string; author: string; location: string; likes: number; comments: number; isLiked?: boolean; createdAt: string };
type Worker = { id: string; name: string; skills: string[]; location: string; rating: number; rate: string; availableFrom: string; availableTo: string };
type Job = { id: string; title: string; description: string; taskType: string; duration: string; location: string; payment: string; postedAt: string; applications: number };

export default function FarmerNetwork() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'posts' | 'workers' | 'jobs'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [postOpen, setPostOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [postForm, setPostForm] = useState({ type: 'question' as 'question' | 'tip' | 'update', title: '', content: '' });
  const [jobForm, setJobForm] = useState({ title: '', description: '', taskType: '', duration: '', location: '', payment: '' });

  useEffect(() => {
    setPosts([
      { id: '1', type: 'question', title: 'Best time to plant tomatoes in Chennai?', content: 'Planning 1-acre tomatoes; which month is ideal?', author: 'Rajesh Kumar', location: 'Chennai, TN', likes: 12, comments: 8, createdAt: new Date().toISOString() },
      { id: '2', type: 'tip', title: 'Neem oil mix for rice pests', content: '5ml neem oil + 1L water every 15 days reduced costs.', author: 'Priya Sharma', location: 'Thanjavur, TN', likes: 24, comments: 15, isLiked: true, createdAt: new Date().toISOString() },
    ]);
    setWorkers([
      { id: 'w1', name: 'Suresh Kumar', skills: ['Harvesting', 'Irrigation'], location: 'Chennai, TN', rating: 4.8, rate: '₹150/hr', availableFrom: '2025-02-01', availableTo: '2025-05-31' },
      { id: 'w2', name: 'Lakshmi Devi', skills: ['Seedling', 'Organic'], location: 'Madurai, TN', rating: 4.6, rate: '₹120/hr', availableFrom: '2025-01-25', availableTo: '2025-04-30' },
    ]);
    setJobs([
      { id: 'j1', title: 'Need 3 workers for rice transplanting', description: 'Work for 5 days from Feb 10.', taskType: 'Transplanting', duration: '5 days', location: 'Thanjavur, TN', payment: '₹800/day + meals', postedAt: new Date().toISOString(), applications: 5 },
      { id: 'j2', title: 'Harvesting help needed - Wheat', description: '2 workers, start tomorrow 6 AM.', taskType: 'Harvesting', duration: '3 days', location: 'Coimbatore, TN', payment: '₹1000/day', postedAt: new Date().toISOString(), applications: 3 },
    ]);
  }, []);

  const toggleLike = (id: string) => setPosts(p => p.map(x => x.id === id ? { ...x, isLiked: !x.isLiked, likes: (x.isLiked ? x.likes - 1 : x.likes + 1) } : x));

  const createPost = () => {
    if (!postForm.title || !postForm.content) return;
    setSaving(true);
    const item: Post = { id: Date.now().toString(), type: postForm.type, title: postForm.title, content: postForm.content, author: 'You', location: 'TN', likes: 0, comments: 0, createdAt: new Date().toISOString() };
    setPosts([item, ...posts]); setPostOpen(false); setPostForm({ type: 'question', title: '', content: '' }); setSaving(false);
  };

  const createJob = () => {
    if (!jobForm.title || !jobForm.description || !jobForm.payment) return;
    setSaving(true);
    const item: Job = { id: Date.now().toString(), title: jobForm.title, description: jobForm.description, taskType: jobForm.taskType, duration: jobForm.duration, location: jobForm.location, payment: jobForm.payment, postedAt: new Date().toISOString(), applications: 0 };
    setJobs([item, ...jobs]); setJobOpen(false); setJobForm({ title: '', description: '', taskType: '', duration: '', location: '', payment: '' }); setSaving(false);
  };

  const PostItem = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <Ionicons name={item.type === 'question' ? 'help-circle' : item.type === 'tip' ? 'bulb' : 'megaphone'} size={16} color={item.type === 'question' ? '#2196F3' : item.type === 'tip' ? '#FF9800' : '#4CAF50'} />
          <Text style={[styles.type, { color: item.type === 'question' ? '#2196F3' : item.type === 'tip' ? '#FF9800' : '#4CAF50' }]}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.content}</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.meta}>{item.author} • {item.location}</Text>
        <View style={styles.rowCenter}>
          <TouchableOpacity style={styles.action} onPress={() => toggleLike(item.id)}>
            <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={18} color={item.isLiked ? '#E53935' : '#666'} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <View style={styles.action}>
            <Ionicons name="chatbubble-outline" size={18} color="#666" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const WorkerItem = ({ item }: { item: Worker }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.badge}><Ionicons name="star" size={14} color="#FFD700" /><Text style={styles.badgeText}>{item.rating}</Text></View>
      </View>
      <Text style={styles.meta}>📍 {item.location} • {item.rate}</Text>
      <View style={styles.tags}>{item.skills.map((s, i) => <Text key={i} style={styles.tag}>#{s}</Text>)}</View>
      <Text style={styles.meta}>Available: {new Date(item.availableFrom).toLocaleDateString()} - {new Date(item.availableTo).toLocaleDateString()}</Text>
      <TouchableOpacity style={styles.primarySm}><Ionicons name="call" size={16} color="#fff" /><Text style={styles.primarySmText}>Contact</Text></TouchableOpacity>
    </View>
  );

  const JobItem = ({ item }: { item: Job }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{new Date(item.postedAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.desc}>{item.description}</Text>
      <View style={styles.rowWrap}>
        <Text style={styles.meta}>🧰 {item.taskType}</Text>
        <Text style={styles.meta}>⏱ {item.duration}</Text>
        <Text style={styles.meta}>📍 {item.location}</Text>
        <Text style={styles.meta}>💵 {item.payment}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.meta}>{item.applications} applications</Text>
        <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Apply</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderList = () => {
    if (tab === 'posts') return <FlatList data={posts} renderItem={PostItem} keyExtractor={i => i.id} contentContainerStyle={styles.list} />;
    if (tab === 'workers') return <FlatList data={workers} renderItem={WorkerItem} keyExtractor={i => i.id} contentContainerStyle={styles.list} />;
    return <FlatList data={jobs} renderItem={JobItem} keyExtractor={i => i.id} contentContainerStyle={styles.list} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={() => (navigation as any)?.openDrawer?.()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Farmer Network</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => (tab === 'posts' ? setPostOpen(true) : tab === 'jobs' ? setJobOpen(true) : null)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'posts' && styles.tabActive]} onPress={() => setTab('posts')}><Text style={[styles.tabText, tab === 'posts' && styles.tabTextActive]}>Community</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'workers' && styles.tabActive]} onPress={() => setTab('workers')}><Text style={[styles.tabText, tab === 'workers' && styles.tabTextActive]}>Workers</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'jobs' && styles.tabActive]} onPress={() => setTab('jobs')}><Text style={[styles.tabText, tab === 'jobs' && styles.tabTextActive]}>Jobs</Text></TouchableOpacity>
      </View>

      {renderList()}

      <Modal visible={postOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Create Post</Text><TouchableOpacity onPress={() => setPostOpen(false)}><Ionicons name="close" size={22} color="#333" /></TouchableOpacity></View>
          <View style={{ padding: 20 }}>
            <View style={styles.row}>
              {(['question', 'tip', 'update'] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.typeBtn, postForm.type === t && styles.typeBtnActive]} onPress={() => setPostForm({ ...postForm, type: t })}><Text style={[styles.typeBtnText, postForm.type === t && styles.typeBtnTextActive]}>{t}</Text></TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#999" value={postForm.title} onChangeText={(v) => setPostForm({ ...postForm, title: v })} />
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Content" placeholderTextColor="#999" multiline value={postForm.content} onChangeText={(v) => setPostForm({ ...postForm, content: v })} />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancel} onPress={() => setPostOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={createPost} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>Post</Text>}</TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={jobOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Post Job</Text><TouchableOpacity onPress={() => setJobOpen(false)}><Ionicons name="close" size={22} color="#333" /></TouchableOpacity></View>
          <View style={{ padding: 20 }}>
            <TextInput style={styles.input} placeholder="Job title" placeholderTextColor="#999" value={jobForm.title} onChangeText={(v) => setJobForm({ ...jobForm, title: v })} />
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor="#999" multiline value={jobForm.description} onChangeText={(v) => setJobForm({ ...jobForm, description: v })} />
            <View style={styles.row}><TextInput style={[styles.input, { flex: 1 }]} placeholder="Task type" placeholderTextColor="#999" value={jobForm.taskType} onChangeText={(v) => setJobForm({ ...jobForm, taskType: v })} /><TextInput style={[styles.input, { flex: 1 }]} placeholder="Duration" placeholderTextColor="#999" value={jobForm.duration} onChangeText={(v) => setJobForm({ ...jobForm, duration: v })} /></View>
            <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#999" value={jobForm.location} onChangeText={(v) => setJobForm({ ...jobForm, location: v })} />
            <TextInput style={styles.input} placeholder="Payment (e.g., ₹800/day)" placeholderTextColor="#999" value={jobForm.payment} onChangeText={(v) => setJobForm({ ...jobForm, payment: v })} />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancel} onPress={() => setJobOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={createJob} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>Post Job</Text>}</TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF2' },
  header: { backgroundColor: '#2E7D32', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 18 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2E7D32' },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  type: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  time: { fontSize: 12, color: '#666' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 6, marginBottom: 6 },
  desc: { fontSize: 14, color: '#666', lineHeight: 20 },
  meta: { fontSize: 13, color: '#666' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 12 },
  actionText: { color: '#666' },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { color: '#2E7D32', fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, color: '#333', fontSize: 12 },
  primary: { backgroundColor: '#2E7D32', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  primaryText: { color: '#fff', fontWeight: 'bold' },
  primarySm: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 10, flexDirection: 'row', gap: 6, alignItems: 'center' },
  primarySmText: { color: '#fff', fontWeight: 'bold' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12 },
  cancel: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { color: '#666', fontSize: 16 },
  save: { flex: 1, backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA', marginTop: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  typeBtnText: { color: '#666', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 10 },
});


