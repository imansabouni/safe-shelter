import React from 'react';
import QRScannerScreen from '../../src/components/QRScannerScreen';
import { useApp } from '../../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function QRTab() {
  const { userData, language, setUserData } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string) => {
      if (screen === 'Home') router.replace('/');
    },
    goBack: () => router.back()
  };

  const handleUpdate = (updates: any) => {
    setUserData(prev => ({ ...prev, ...updates }));
  };

  return (
    <QRScannerScreen 
      userData={userData} 
      language={language} 
      onUpdateUser={handleUpdate}
      navigation={navigationProxy as any} 
    />
  );
}
