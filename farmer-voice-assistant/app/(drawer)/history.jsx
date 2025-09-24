import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const HISTORY_KEY = 'conversationHistory';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      if (history) {
        const parsed = JSON.parse(history);
        setConversations(parsed);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredConversations(filtered);
  };

  const deleteConversation = (id) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = conversations.filter(conv => conv.id !== id);
            setConversations(updated);
            saveConversations(updated);
          },
        },
      ]
    );
  };

  const saveConversations = async (convs) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const replayConversation = (messages) => {
    Alert.alert(
      'Replay Conversation',
      'Would you like to hear the assistant responses?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replay',
          onPress: () => {
            messages
              .filter(msg => msg.role === 'assistant' && msg.text)
              .forEach((msg, index) => {
                setTimeout(() => {
                  Speech.speak(msg.text, { language: 'hi-IN' });
                }, index * 3000);
              });
          },
        },
      ]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setConversations([]);
            await AsyncStorage.removeItem(HISTORY_KEY);
          },
        },
      ]
    );
  };

  const renderConversation = ({ item }) => (
    <View style={styles.conversationCard}>
      <View style={styles.conversationHeader}>
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationTitle}>{item.title}</Text>
          <Text style={styles.conversationDate}>
            {new Date(item.timestamp).toLocaleDateString()} • {item.messages.length} messages
          </Text>
        </View>
        <View style={styles.conversationActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => replayConversation(item.messages)}
          >
            <Ionicons name="play-outline" size={20} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => deleteConversation(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.conversationPreview}>
        {item.messages.slice(0, 2).map((msg, index) => (
          <View key={index} style={styles.previewMessage}>
            <Text style={[
              styles.previewText,
              msg.role === 'user' ? styles.userPreview : styles.assistantPreview
            ]}>
              {msg.role === 'user' ? '👤 ' : '🤖 '}
              {msg.text?.substring(0, 80)}
              {msg.text?.length > 80 ? '...' : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const emptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyText}>
        Start chatting with your farming assistant to see your conversation history here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.openDrawer && navigation.openDrawer()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📜 Conversation History</Text>
        <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllHistory}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.clearAllText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={emptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FFF2',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#666',
  },
  conversationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  conversationPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  previewMessage: {
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userPreview: {
    color: '#4E342E',
  },
  assistantPreview: {
    color: '#1B5E20',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});