import React from 'react';
import FamilyScreen from '../src/components/FamilyScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Family() {
  const { userData, language, setUserData } = useApp();
  const router = useRouter();

  const navigation = useAppNavigation();

  return (
    <FamilyScreen 
      userData={userData || undefined} 
      language={language} 
      onUpdateUser={(updates) => setUserData(prev => prev ? { ...prev, ...updates } : null)}
      navigation={navigation as any} 
    />
  );
}
