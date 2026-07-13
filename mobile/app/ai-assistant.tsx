import React from 'react';
import AIAssistantScreen from '../src/components/AIAssistantScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function AIAssistant() {
  const { userData, language } = useApp();
  const navigation = useAppNavigation();

  return (
    <AIAssistantScreen 
      userData={userData} 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
