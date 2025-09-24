import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';
const PROFILE_KEY = 'userProfile';
const ONBOARDED_KEY = 'isOnboarded';

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

// Mock login/signup for now; replace with backend calls later
export async function loginWithOtp(phone: string, otp: string): Promise<{ token: string; firstLogin: boolean }>
{
  // TODO: call backend /auth/login
  const firstLogin = !(await getProfile());
  const token = 'demo-token';
  await setToken(token);
  return { token, firstLogin };
}

export async function signup(phone: string, name: string): Promise<{ token: string; firstLogin: boolean }>
{
  // TODO: call backend /auth/signup
  const token = 'demo-token';
  await setToken(token);
  await setProfile({ phone, name, firstLogin: true, role: 'farmer' });
  return { token, firstLogin: true };
}

export async function logout(): Promise<void> {
  await setToken(null);
}


