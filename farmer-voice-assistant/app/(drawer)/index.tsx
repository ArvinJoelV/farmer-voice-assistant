import React, { useState,useEffect, useRef } from "react";
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
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  role: "user" | "assistant";
  text?: string;
  audioUri?: string;
};

export default function FarmerAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMockConversation()
  }, []);

  const sendTextMessage = async (text: string) => {
  if (!text.trim()) return;
  setMessages((prev) => [...prev, { role: "user", text }]);
  setInput("");
  setLoading(true);

  try {
    // Send question to backend instead of Ollama directly
    const ansRes = await axios.post("http://192.168.31.131:8000/answer", {
      question: text
    });

    const answer = ansRes.data.answer || "❌ No answer from backend";
    console.log(answer);

    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    Speech.speak(answer, { language: ansRes.data.lang });
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "❌ Error fetching answer." },
    ]);
  }

  setLoading(false);
  scrollToBottom();
};


  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;
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
      alert("Could not start recording: " + err);
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
      alert("Error stopping recording: " + err);
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
    // Upload audio for STT
    const formData = new FormData();
    formData.append("audio", {
      uri: pendingAudio.startsWith("file://") ? pendingAudio : `file://${pendingAudio}`,
      type: "audio/wav",
      name: "audio.wav",
    } as any);

    const sttRes = await axios.post("http://192.168.31.131:8000/stt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const transcript = sttRes.data.text;
    console.log(transcript);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: transcript, audioUri: pendingAudio },
    ]);

    // Send transcript to backend QA endpoint
    const ansRes = await axios.post("http://192.168.31.131:8000/answer", {
      question: transcript
    });

    const answer = ansRes.data.answer || "❌ No answer from backend";
    console.log(answer);

    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    Speech.speak(answer, { language: ansRes.data.lang });
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "❌ Error with voice input." },
    ]);
  }

  setPendingAudio(null);
  setLoading(false);
  scrollToBottom();
};

  const loadMockConversation = () => {
  const welcomeMessage: Message = {
    role: "assistant",
    text: "🙏 नमस्ते! நான் உங்கள் விவசாய உதவியாளர். Ask me anything about farming and I’ll help you.",
  };

  setMessages([welcomeMessage]);

  // 🔊 Speak each part separately in correct language
  Speech.speak("नमस्ते!", { language: "hi-IN" });
  Speech.speak("நான் உங்கள் விவசாய உதவியாளர்.", { language: "ta-IN" });
  Speech.speak("Ask me anything about farming and I’ll help you.", { language: "en-US" });

  scrollToBottom();
};



  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
        >
          <Ionicons
            name="play"
            size={20}
            color={item.role === "user" ? "#222" : "#228B22"}
          />
        </TouchableOpacity>

        {/* ✅ Show transcript under audio if available */}
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
  </View>
);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
            placeholder="Type your question..."
            placeholderTextColor="#aaa"
            onSubmitEditing={() => sendTextMessage(input)}
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
  container: { flex: 1, backgroundColor: "#F3FDF6" }, // soft green background
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
    backgroundColor: "#FFF3E0", // warm cream
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9", // light nature green
    borderTopLeftRadius: 4,
  },

  userText: { color: "#4E342E", fontSize: 16 },
  assistantText: { color: "#1B5E20", fontSize: 16 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  sendBtn: {
    backgroundColor: "#2E7D32", // deep green
    padding: 12,
    borderRadius: 25,
    marginLeft: 6,
  },
  micBtn: {
    backgroundColor: "#2E7D32", // deep green
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
