import React from 'react';
import SOSScreen from '../src/components/SOSScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function SOS() {
  const { userData, language } = useApp();
  const router = useRouter();

  const navigation = useAppNavigation();

  return (
    <SOSScreen 
      userData={userData || undefined} 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
