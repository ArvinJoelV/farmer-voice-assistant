/**
 * Crop Information API Service
 * 
 * Handles API calls to fetch crop-specific information including
 * growth stages, calendar, and recommendations for any crop.
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
        return parsed.backendUrl;
      }
    }
  } catch (error) {
    console.error('Error loading backend URL:', error);
  }
  // Default fallback
  return 'http://10.117.149.12:8000';
};

/**
 * Crop growth stage information
 */
export interface CropStage {
  name: string;
  duration: number;  // days
  actions: string[];
  fertilizers: string[];
  irrigation: string;
  pest: string[];
  description?: string;
}

/**
 * Complete crop information
 */
export interface CropInfo {
  crop_name: string;
  stages: CropStage[];
  total_duration: number;  // total days from sowing to harvest
  description?: string;
  common_varieties?: string[];
}

/**
 * Get crop information including growth stages for any crop
 * 
 * @param cropName - Name of the crop (e.g., "wheat", "rice", "maize")
 * @returns Crop information with stages and calendar
 */
export async function getCropInfo(cropName: string): Promise<CropInfo> {
  try {
    const backendUrl = await getBackendUrl();
    const url = `${backendUrl}/crop-info/${encodeURIComponent(cropName)}`;
    
    console.log('🌾 Fetching crop info:', url);
    
    const response = await axios.get<CropInfo>(url, {
      timeout: 15000,
    });
    
    console.log('✅ Crop info received:', response.data.crop_name);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching crop info:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.detail || 
          `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      }
    }
    throw new Error(error.message || 'Failed to get crop information');
  }
}

/**
 * Get list of all available crops in the database
 * 
 * @returns List of available crop names
 */
export async function getAvailableCropNames(): Promise<Array<{name: string; key: string; description: string}>> {
  try {
    const backendUrl = await getBackendUrl();
    const response = await axios.get<{crops: Array<{name: string; key: string; description: string}>, count: number}>(
      `${backendUrl}/crop-info/`,
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

