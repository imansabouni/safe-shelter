import React from 'react';
import DonationScreen from '../src/components/DonationScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Donation() {
  const { userData, language } = useApp();
  const navigation = useAppNavigation();

  return (
    <DonationScreen 
      userData={userData} 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
