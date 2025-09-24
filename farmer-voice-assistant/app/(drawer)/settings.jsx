import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇮🇳' },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [backendUrl, setBackendUrl] = useState('http://10.114.75.244:8000');
  const [userLocation, setUserLocation] = useState('Chennai, Tamil Nadu');
  const [offlineMode, setOfflineMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('farmerSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setSelectedLanguage(parsed.language || 'hi');
        setBackendUrl(parsed.backendUrl || 'http://10.114.75.244:8000');
        setUserLocation(parsed.location || 'Chennai, Tamil Nadu');
        setOfflineMode(parsed.offlineMode || false);
        setVoiceEnabled(parsed.voiceEnabled !== false);
        setNotificationsEnabled(parsed.notificationsEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        language: selectedLanguage,
        backendUrl,
        location: userLocation,
        offlineMode,
        voiceEnabled,
        notificationsEnabled,
      };
      await AsyncStorage.setItem('farmerSettings', JSON.stringify(settings));
      Alert.alert('✅ Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save settings');
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${backendUrl}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'test connection' }),
      });
      
      if (response.ok) {
        Alert.alert('✅ Connection Success', 'Backend is working properly!');
      } else {
        Alert.alert('❌ Connection Failed', 'Backend is not responding');
      }
    } catch (error) {
      Alert.alert('❌ Connection Error', 'Cannot reach backend server');
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('conversationHistory');
              Alert.alert('✅ Cleared', 'Conversation history has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.openDrawer && navigation.openDrawer()}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your farming assistant</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Language Preference</Text>
        <View style={styles.languageGrid}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                selectedLanguage === lang.code && styles.selectedLanguage,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={[
                styles.languageName,
                selectedLanguage === lang.code && styles.selectedLanguageText
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Backend Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Backend Server</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Server URL:</Text>
          <TextInput
            style={styles.textInput}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://your-server:8000"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.testBtn} onPress={testConnection}>
            <Text style={styles.testBtnText}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Your Location</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Village/City:</Text>
          <TextInput
            style={styles.textInput}
            value={userLocation}
            onChangeText={setUserLocation}
            placeholder="Enter your location for weather"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>��️ App Preferences</Text>
        
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Voice Assistant</Text>
            <Text style={styles.switchDescription}>Enable voice input/output</Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={setVoiceEnabled}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={voiceEnabled ? '#2E7D32' : '#F4F3F4'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Offline Mode</Text>
            <Text style={styles.switchDescription}>Use cached responses when offline</Text>
          </View>
          <Switch
            value={offlineMode}
            onValueChange={setOfflineMode}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={offlineMode ? '#2E7D32' : '#F4F3F4'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Notifications</Text>
            <Text style={styles.switchDescription}>Get farming tips and alerts</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={notificationsEnabled ? '#2E7D32' : '#F4F3F4'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗂️ Data Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={clearHistory}>
          <Ionicons name="trash-outline" size={20} color="#E53935" />
          <Text style={styles.actionButtonText}>Clear Conversation History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={saveSettings}>
          <Ionicons name="download-outline" size={20} color="#2E7D32" />
          <Text style={styles.actionButtonText}>Export Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>💾 Save All Settings</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About CROPWISE</Text>
        <Text style={styles.infoText}>Version 1.0.0</Text>
        <Text style={styles.infoText}>Voice Assistant for Farmers</Text>
        <Text style={styles.infoText}>Made with ❤️ for Indian Agriculture</Text>
      </View>
    </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    minWidth: '45%',
  },
  selectedLanguage: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  selectedLanguageText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  testBtn: {
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});