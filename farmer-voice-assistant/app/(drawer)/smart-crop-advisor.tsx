import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { recommendCrop, CropPrediction, CropRequestPayload } from "../../services/cropAdvisor";

export default function SmartCropAdvisorScreen() {
  const navigation = useNavigation();
  
  // Form state
  const [N, setN] = useState("");
  const [P, setP] = useState("");
  const [K, setK] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [ph, setPh] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [location, setLocation] = useState(""); // Optional field
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate and convert input fields to numbers
   */
  const validateInputs = (): CropRequestPayload | null => {
    const fields = [
      { name: "Nitrogen (N)", value: N },
      { name: "Phosphorus (P)", value: P },
      { name: "Potassium (K)", value: K },
      { name: "Temperature", value: temperature },
      { name: "Humidity", value: humidity },
      { name: "pH", value: ph },
      { name: "Rainfall", value: rainfall },
    ];

    // Check for empty fields
    for (const field of fields) {
      if (!field.value.trim()) {
        Alert.alert("Missing Field", `Please enter ${field.name}`);
        return null;
      }
    }

    // Convert to numbers and validate ranges
    const numN = parseFloat(N);
    const numP = parseFloat(P);
    const numK = parseFloat(K);
    const numTemp = parseFloat(temperature);
    const numHumidity = parseFloat(humidity);
    const numPh = parseFloat(ph);
    const numRainfall = parseFloat(rainfall);

    // Check for NaN
    if (
      isNaN(numN) ||
      isNaN(numP) ||
      isNaN(numK) ||
      isNaN(numTemp) ||
      isNaN(numHumidity) ||
      isNaN(numPh) ||
      isNaN(numRainfall)
    ) {
      Alert.alert("Invalid Input", "Please enter valid numbers for all fields");
      return null;
    }

    // Basic range validation
    if (numN < 0 || numN > 200) {
      Alert.alert("Invalid Range", "Nitrogen (N) should be between 0 and 200");
      return null;
    }
    if (numP < 0 || numP > 200) {
      Alert.alert("Invalid Range", "Phosphorus (P) should be between 0 and 200");
      return null;
    }
    if (numK < 0 || numK > 200) {
      Alert.alert("Invalid Range", "Potassium (K) should be between 0 and 200");
      return null;
    }
    if (numTemp < -50 || numTemp > 60) {
      Alert.alert("Invalid Range", "Temperature should be between -50°C and 60°C");
      return null;
    }
    if (numHumidity < 0 || numHumidity > 100) {
      Alert.alert("Invalid Range", "Humidity should be between 0% and 100%");
      return null;
    }
    if (numPh < 0 || numPh > 14) {
      Alert.alert("Invalid Range", "pH should be between 0 and 14");
      return null;
    }
    if (numRainfall < 0 || numRainfall > 1000) {
      Alert.alert("Invalid Range", "Rainfall should be between 0 and 1000 mm");
      return null;
    }

    return {
      N: numN,
      P: numP,
      K: numK,
      temperature: numTemp,
      humidity: numHumidity,
      ph: numPh,
      rainfall: numRainfall,
    };
  };

  /**
   * Handle recommendation request
   */
  const handleGetRecommendation = async () => {
    setError(null);
    setResult(null);

    console.log('🔍 Validating inputs...');
    const payload = validateInputs();
    if (!payload) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('✅ Validation passed, calling API...');
    setLoading(true);

    try {
      console.log('📡 Calling recommendCrop with payload:', payload);
      const prediction = await recommendCrop(payload);
      console.log('✅ Received prediction:', prediction);
      setResult(prediction);
    } catch (err: any) {
      console.error('❌ Error in handleGetRecommendation:', err);
      const errorMessage = err.message || "Failed to get crop recommendation";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear all inputs and results
   */
  const handleClear = () => {
    setN("");
    setP("");
    setK("");
    setTemperature("");
    setHumidity("");
    setPh("");
    setRainfall("");
    setLocation("");
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation as any)?.openDrawer?.()}
          style={styles.menuBtn}
        >
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 Smart Crop Advisor</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="information-circle" size={20} color="#2E7D32" />
          <Text style={styles.helperText}>
            Enter your soil and weather values to get AI-powered crop suggestions
            tailored to your conditions.
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Soil Nutrients</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nitrogen (N)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 90"
              placeholderTextColor="#999"
              value={N}
              onChangeText={setN}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phosphorus (P)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 42"
              placeholderTextColor="#999"
              value={P}
              onChangeText={setP}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Potassium (K)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 43"
              placeholderTextColor="#999"
              value={K}
              onChangeText={setK}
              keyboardType="numeric"
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Weather Conditions</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 20.8"
              placeholderTextColor="#999"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Humidity (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 82.0"
              placeholderTextColor="#999"
              value={humidity}
              onChangeText={setHumidity}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>pH</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6.5"
              placeholderTextColor="#999"
              value={ph}
              onChangeText={setPh}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rainfall (mm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 202.9"
              placeholderTextColor="#999"
              value={rainfall}
              onChangeText={setRainfall}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chennai, Tamil Nadu"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
          >
            <Ionicons name="refresh-outline" size={18} color="#666" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleGetRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="leaf" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Get Recommendation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#E53935" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result Display */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              <Text style={styles.resultTitle}>Recommendation</Text>
            </View>

            {/* Best Crop */}
            <View style={styles.bestCropCard}>
              <Text style={styles.bestCropLabel}>Recommended Crop</Text>
              <Text style={styles.bestCropName}>{result.best_crop}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {result.confidence.toFixed(1)}% Confidence
                </Text>
              </View>
            </View>

            {/* Top 3 Crops */}
            <View style={styles.topCropsSection}>
              <Text style={styles.topCropsTitle}>Top 3 Recommendations</Text>
              {result.top_3.map((cropScore, index) => (
                <View key={index} style={styles.cropScoreCard}>
                  <View style={styles.cropScoreHeader}>
                    <Text style={styles.cropScoreRank}>#{index + 1}</Text>
                    <Text style={styles.cropScoreName}>{cropScore.crop}</Text>
                  </View>
                  <View style={styles.scoreBarContainer}>
                    <View
                      style={[
                        styles.scoreBar,
                        { width: `${cropScore.score * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.cropScorePercent}>
                    {(cropScore.score * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Reasoning */}
            <View style={styles.reasoningCard}>
              <Text style={styles.reasoningTitle}>💡 Reasoning</Text>
              <Text style={styles.reasoningText}>{result.reasoning}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FFF2",
  },
  header: {
    backgroundColor: "#2E7D32",
    padding: 16,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  helperCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  helperText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#2E7D32",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  errorCard: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#E53935",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginLeft: 8,
  },
  bestCropCard: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  bestCropLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  bestCropName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  confidenceBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  topCropsSection: {
    marginBottom: 16,
  },
  topCropsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  cropScoreCard: {
    marginBottom: 12,
  },
  cropScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cropScoreRank: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
    width: 24,
  },
  cropScoreName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textTransform: "capitalize",
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  scoreBar: {
    height: "100%",
    backgroundColor: "#43A047",
    borderRadius: 4,
  },
  cropScorePercent: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  reasoningCard: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});

