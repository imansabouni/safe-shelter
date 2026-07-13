import React from 'react';
import SmartCardScreen from '../../src/components/SmartCardScreen';
import { useApp } from '../../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function ProfileTab() {
  const { userData, language } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string) => {
      if (screen === 'Home') router.replace('/');
      if (screen === 'Settings') router.push('/settings');
    },
    goBack: () => router.back()
  };

  return (
    <SmartCardScreen 
      userData={userData} 
      language={language} 
      navigation={navigationProxy as any} 
    />
  );
}
