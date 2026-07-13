import React from 'react';
import SettingsScreen from '../src/components/SettingsScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Settings() {
  const { userData, language, setLanguage } = useApp();
  const navigation = useAppNavigation();

  return (
    <SettingsScreen 
      userData={userData || undefined} 
      language={language} 
      onLanguageChange={setLanguage}
      navigation={navigation as any} 
    />
  );
}
