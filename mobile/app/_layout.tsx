import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AppProvider } from '../src/context/AppContext';
import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Suppress "Keep Awake" warnings in development
if (__DEV__) {
  const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  if (originalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: any) => {
      if (error?.message?.includes('Unable to activate keep awake')) {
        return;
      }
      originalHandler(error, isFatal);
    });
  }
}

// Ignore specific Keep Awake logs
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.toString().includes('Unable to activate keep awake')) return;
    originalConsoleError(...args);
  };
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <GlobalAlertBanner />
        </NavigationThemeProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Bell as LucideBell } from 'lucide-react-native';
const BellIcon = LucideBell as any;

function GlobalAlertBanner() {
  const { globalAlert, setGlobalAlert } = useApp();
  const router = useRouter();
  const [bounceAnim] = React.useState(new Animated.Value(-150));

  React.useEffect(() => {
    if (globalAlert) {
      Animated.spring(bounceAnim, {
        toValue: 20,
        useNativeDriver: true,
        friction: 6,
        tension: 40
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(bounceAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true
        }).start(() => setGlobalAlert(null));
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [globalAlert]);

  if (!globalAlert) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: bounceAnim }] }]}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => {
            const isFriendAlert = globalAlert.toLowerCase().includes('arkadaş') || globalAlert.toLowerCase().includes('yakın');
            setGlobalAlert(null);
            if (isFriendAlert) {
              router.push('/friends');
            } else {
              router.push('/notifications');
            }
          }}
          style={styles.bannerContent}
        >
          <BellIcon size={18} color="#FFF" />
          <Text style={styles.bannerText}>{globalAlert}</Text>
        </TouchableOpacity>
    </Animated.View>
  );
}

import React from 'react';

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    maxWidth: '92%',
    backgroundColor: '#60A5FA',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 22,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)'
  },
  bannerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  bannerText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '900',
  }
});