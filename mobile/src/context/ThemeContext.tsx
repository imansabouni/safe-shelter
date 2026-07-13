import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as nativeColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  accent: string;
  headerText: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  primary: '#1E3A8A',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  accent: '#3B82F6',
  headerText: '#FFFFFF'
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#3B82F6',
  text: '#F9FAFB',
  textSecondary: '#94A3B8',
  border: '#334155',
  card: '#1E293B',
  accent: '#60A5FA',
  headerText: '#FFFFFF'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = nativeColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = mode === 'dark' ? darkColors : lightColors;
  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
