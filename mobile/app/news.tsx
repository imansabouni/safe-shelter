import React from 'react';
import NewsScreen from '../src/components/NewsScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function News() {
  const { userData, language } = useApp();
  const navigation = useAppNavigation();

  return (
    <NewsScreen 
      userData={userData} 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
