/**
 * Language Context for App-wide Language Management
 * 
 * Provides language state and translation functions to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../translations';

export type LanguageCode = 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'en';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'appLanguage';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('hi');

  // Load language from storage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      // First try to get from farmerSettings
      const settings = await AsyncStorage.getItem('farmerSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.language) {
          setLanguageState(parsed.language as LanguageCode);
          return;
        }
      }
      
      // Fallback to dedicated language storage
      const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLang && translations[storedLang as LanguageCode]) {
        setLanguageState(storedLang as LanguageCode);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: LanguageCode) => {
    try {
      setLanguageState(lang);
      
      // Save to both locations for consistency
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      
      // Also update farmerSettings
      const settings = await AsyncStorage.getItem('farmerSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      parsed.language = lang;
      await AsyncStorage.setItem('farmerSettings', JSON.stringify(parsed));
      
      console.log(`🌐 Language changed to: ${lang}`);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Translation function
  const t = (key: string): string => {
    const langTranslations = translations[language] || translations['en'];
    return langTranslations[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

