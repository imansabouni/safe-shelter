import React from 'react';
import InternalMapScreen from '../src/components/InternalMapScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';
import { useLocalSearchParams } from 'expo-router';

export default function InternalMap() {
  const { userData, language } = useApp();
  const navigation = useAppNavigation();
  const params = useLocalSearchParams();

  return (
    <InternalMapScreen 
      userData={userData as any} 
      language={language} 
      navigation={navigation as any}
      route={{ params }}
    />
  );
}
