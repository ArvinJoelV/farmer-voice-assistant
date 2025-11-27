/**
 * Crop Advisor API Service
 * 
 * Handles API calls to the backend for smart crop recommendations
 * based on soil and weather parameters.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get backend URL from settings or use default
const getBackendUrl = async (): Promise<string> => {
  try {
    const settings = await AsyncStorage.getItem('farmerSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.backendUrl) {
        console.log('📡 Using backend URL from settings:', parsed.backendUrl);
        return parsed.backendUrl;
      }
    }
  } catch (error) {
    console.error('Error loading backend URL:', error);
  }
  // Default fallback - update this to match your backend URL
  const defaultUrl = 'http://192.168.31.131:8000';
  console.log('📡 Using default backend URL:', defaultUrl);
  return defaultUrl;
};

/**
 * Request payload for crop recommendation
 */
export interface CropRequestPayload {
  N: number;              // Nitrogen content
  P: number;              // Phosphorus content
  K: number;              // Potassium content
  temperature: number;    // Temperature in Celsius
  humidity: number;       // Humidity percentage (0-100)
  ph: number;            // Soil pH value
  rainfall: number;       // Rainfall in mm
}

/**
 * Crop score with probability
 */
export interface CropScore {
  crop: string;
  score: number;  // Probability score (0-1)
}

/**
 * Crop recommendation response
 */
export interface CropPrediction {
  best_crop: string;
  confidence: number;  // Confidence percentage (0-100)
  top_3: CropScore[];
  reasoning: string;
  explanation_features: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

/**
 * Get crop recommendation based on soil and weather parameters
 * 
 * @param payload - Soil and weather parameters
 * @returns Crop prediction with recommendations
 */
export async function recommendCrop(
  payload: CropRequestPayload
): Promise<CropPrediction> {
  try {
    const backendUrl = await getBackendUrl();
    const url = `${backendUrl}/crop/recommend`;
    
    console.log('🌱 Crop Advisor API Call:');
    console.log('  URL:', url);
    console.log('  Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post<CropPrediction>(
      url,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    console.log('✅ Crop Advisor Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Crop Advisor API Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        console.error('  Response Error:', error.response.status, error.response.data);
        throw new Error(
          error.response.data?.detail || 
          `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        // Request made but no response
        console.error('  No Response:', error.request);
        throw new Error('No response from server. Please check your connection and backend URL.');
      }
    }
    throw new Error(error.message || 'Failed to get crop recommendation');
  }
}

/**
 * Get list of available crops that the model can recommend
 * 
 * @returns List of available crop names
 */
export async function getAvailableCrops(): Promise<string[]> {
  try {
    const backendUrl = await getBackendUrl();
    const response = await axios.get<{ crops: string[]; count: number }>(
      `${backendUrl}/crop/available-crops`,
      {
        timeout: 10000,
      }
    );
    return response.data.crops;
  } catch (error: any) {
    console.error('Error fetching available crops:', error);
    return []; // Return empty array on error
  }
}

