import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';
const PROFILE_KEY = 'userProfile';
const ONBOARDED_KEY = 'isOnboarded';

// Backend configuration
const BACKEND_URL = 'http://10.117.149.12:8000'; // Update this to match your backend URL

export type UserProfile = {
  id?: string;
  name?: string;
  phone?: string;
  role?: 'farmer' | 'worker' | 'buyer' | 'admin';
  region?: string;
  landSize?: number;
  landUnit?: 'acres' | 'hectares';
  firstLogin?: boolean;
};

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getProfile(): Promise<UserProfile | null> {
  const s = await AsyncStorage.getItem(PROFILE_KEY);
  return s ? JSON.parse(s) : null;
}

export async function setProfile(profile: UserProfile | null): Promise<void> {
  if (profile) await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  else await AsyncStorage.removeItem(PROFILE_KEY);
}

export async function isOnboarded(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDED_KEY);
  return v === 'true';
}

export async function setOnboarded(v: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, v ? 'true' : 'false');
}

// Request OTP from backend
export async function requestOtp(phone: string): Promise<{ ok: boolean; dev_code?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw new Error('Failed to request OTP');
  }
}

// Verify OTP with backend
export async function loginWithOtp(phone: string, otp: string): Promise<{ token: string; firstLogin: boolean; user: any }> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'OTP verification failed');
    }

    const data = await response.json();
    await setToken(data.token);

    // Check if this is first login by checking if user has profile data
    const existingProfile = await getProfile();
    const firstLogin = !existingProfile;

    return {
      token: data.token,
      firstLogin,
      user: data.user
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

// Update user profile on backend
export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  try {
    const token = await getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await setProfile(data);
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Get current user from backend
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear it
        await setToken(null);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await setProfile(data);
    return data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signup(phone: string, name: string): Promise<{ token: string; firstLogin: boolean }> {
  // For now, signup uses the same OTP flow as login
  // In a real implementation, you might have a separate signup endpoint
  const token = 'demo-token';
  await setToken(token);
  await setProfile({ phone, name, firstLogin: true, role: 'farmer' });
  return { token, firstLogin: true };
}

export async function logout(): Promise<void> {
  await setToken(null);
}


