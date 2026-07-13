import React from 'react';
import SafetyGuidanceScreen from '../src/components/SafetyGuidanceScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function SafetyGuidance() {
  const { language } = useApp();
  const navigation = useAppNavigation();

  return (
    <SafetyGuidanceScreen 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
