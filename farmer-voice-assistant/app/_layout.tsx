import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { getToken, isOnboarded } from '../services/auth';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      const ob = await isOnboarded();
      setHasToken(!!t);
      setOnboarded(ob);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#43A047" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {hasToken ? (
          <Stack.Screen name="(drawer)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        {!onboarded && <Stack.Screen name="(auth)/onboarding" />}
        <Stack.Screen name="not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
