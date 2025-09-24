import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Message = {
  role: "user" | "assistant";
  text?: string;
  audioUri?: string;
  timestamp?: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};

export default function FarmerAssistantScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});

  const flatListRef = useRef<FlatList>(null);
  const HISTORY_KEY = 'conversationHistory';

  useEffect(() => {
    loadSettings();
    loadMockConversation();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('farmerSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    try {
      const existingHistory = await AsyncStorage.getItem(HISTORY_KEY);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Remove old conversation with same ID if exists
      const updatedHistory = history.filter((conv: Conversation) => conv.id !== conversation.id);
      updatedHistory.unshift(conversation); // Add to beginning
      
      // Keep only last 50 conversations
      const limitedHistory = updatedHistory.slice(0, 50);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const generateConversationTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage?.text) {
      return firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '');
    }
    return 'New Conversation';
  };

  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      role: "user",
      text,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const backendUrl = settings.backendUrl || 'http://10.114.75.244:8000';
      const ansRes = await axios.post(`${backendUrl}/answer`, {
        question: text
      });

      const answer = ansRes.data.answer || "❌ No answer from backend";
      const language = ansRes.data.lang || 'hi';

      const assistantMessage: Message = {
        role: "assistant",
        text: answer,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the answer if voice is enabled
      if (settings.voiceEnabled !== false) {
        Speech.speak(answer, { language: `${language}-IN` });
      }
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        text: "❌ Error fetching answer. Please check your connection.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
    scrollToBottom();
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow microphone access to use voice features.");
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Recording Error", "Could not start recording: " + err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setPendingAudio(uri || null);
    } catch (err) {
      Alert.alert("Recording Error", "Error stopping recording: " + err);
    }
  };

  const playPendingAudio = async () => {
    if (!pendingAudio) return;
    
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: pendingAudio });
    setSound(newSound);
    await newSound.playAsync();
  };

  const cancelPendingAudio = () => {
    setPendingAudio(null);
  };

  const sendPendingAudio = async () => {
    if (!pendingAudio) return;
    setLoading(true);

    try {
      const backendUrl = settings.backendUrl || 'http://10.114.75.244:8000';
      
      // Upload audio for STT
      const formData = new FormData();
      formData.append("audio", {
        uri: pendingAudio.startsWith("file://") ? pendingAudio : `file://${pendingAudio}`,
        type: "audio/wav",
        name: "audio.wav",
      } as any);

      const sttRes = await axios.post(`${backendUrl}/stt`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const transcript = sttRes.data.text;
      console.log("Transcript:", transcript);

      const userMessage: Message = {
        role: "user",
        text: transcript,
        audioUri: pendingAudio,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send transcript to backend QA endpoint
      const ansRes = await axios.post(`${backendUrl}/answer`, {
        question: transcript
      });

      const answer = ansRes.data.answer || "❌ No answer from backend";
      const language = ansRes.data.lang || 'hi';

      const assistantMessage: Message = {
        role: "assistant",
        text: answer,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the answer if voice is enabled
      if (settings.voiceEnabled !== false) {
        Speech.speak(answer, { language: `${language}-IN` });
      }
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        text: "❌ Error with voice input. Please try again.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setPendingAudio(null);
    setLoading(false);
    scrollToBottom();
  };

  const loadMockConversation = () => {
    const welcomeMessage: Message = {
      role: "assistant",
      text: "🙏 नमस्ते! நான் உங்கள் விவசாய உதவியாளர். Ask me anything about farming and I'll help you.",
      timestamp: Date.now()
    };

    setMessages([welcomeMessage]);
    setConversationId(Date.now().toString());

    // Speak welcome message if voice is enabled
    if (settings.voiceEnabled !== false) {
      Speech.speak("नमस्ते!", { language: "hi-IN" });
      Speech.speak("நான் உங்கள் விவசாய உதவியாளர்.", { language: "ta-IN" });
      Speech.speak("Ask me anything about farming and I'll help you.", { language: "en-US" });
    }

    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const saveCurrentConversation = async () => {
    if (messages.length > 1 && conversationId) { // More than just welcome message
      const conversation: Conversation = {
        id: conversationId,
        title: generateConversationTitle(messages),
        messages,
        timestamp: Date.now()
      };
      await saveConversation(conversation);
    }
  };

  const startNewConversation = () => {
    Alert.alert(
      "New Conversation",
      "Start a new conversation? Current conversation will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "New Chat",
          onPress: async () => {
            await saveCurrentConversation();
            setMessages([]);
            setConversationId(Date.now().toString());
            loadMockConversation();
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {item.audioUri ? (
        <View>
          <TouchableOpacity
            onPress={async () => {
              const { sound } = await Audio.Sound.createAsync({ uri: item.audioUri! });
              await sound.playAsync();
            }}
            style={styles.audioButton}
          >
            <Ionicons
              name="play"
              size={20}
              color={item.role === "user" ? "#222" : "#228B22"}
            />
          </TouchableOpacity>

          {item.text && (
            <Text style={item.role === "user" ? styles.userText : styles.assistantText}>
              {item.text}
            </Text>
          )}
        </View>
      ) : (
        <Text style={item.role === "user" ? styles.userText : styles.assistantText}>
          {item.text}
        </Text>
      )}
      
      {item.timestamp && (
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header with New Chat Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any)?.openDrawer?.()} style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 CROPWISE Assistant</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={startNewConversation}>
          <Ionicons name="add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.chatContainer}
      />

      {loading && <ActivityIndicator size="large" color="#228B22" style={{ marginBottom: 10 }} />}

      {pendingAudio ? (
        <View style={styles.pendingBox}>
          <Text style={{ fontSize: 16 }}>🎤 Voice message ready</Text>
          <View style={styles.pendingActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={playPendingAudio}>
              <Ionicons name="play" size={22} color="#228B22" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={sendPendingAudio}>
              <Ionicons name="send" size={22} color="#43A047" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={cancelPendingAudio}>
              <Ionicons name="trash" size={22} color="#E53935" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about crops, weather, fertilizers..."
            placeholderTextColor="#aaa"
            onSubmitEditing={() => sendTextMessage(input)}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendTextMessage(input)}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.recording]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3FDF6" },
  header: {
    backgroundColor: "#2E7D32",
    padding: 16,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  menuBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  newChatBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  chatContainer: { padding: 10, paddingBottom: 80 },
  message: {
    maxWidth: "75%",
    padding: 14,
    marginVertical: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFF3E0",
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    borderTopLeftRadius: 4,
  },
  userText: { color: "#4E342E", fontSize: 16 },
  assistantText: { color: "#1B5E20", fontSize: 16 },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 12,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#2E7D32",
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 25,
    marginLeft: 6,
  },
  micBtn: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 25,
    marginLeft: 6,
  },
  recording: {
    backgroundColor: "#E53935",
  },
  pendingBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingActions: { flexDirection: "row", gap: 12 },
  actionBtn: { marginHorizontal: 8 },
});