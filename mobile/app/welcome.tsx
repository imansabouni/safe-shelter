import React from 'react';
import WelcomeScreen from '../src/components/WelcomeScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const { language, setLanguage, login } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string) => {
      if (screen === 'Login') router.push('/login');
      if (screen === 'Registration') router.push('/register');
      if (screen === 'Home') {
        // Misafir girişi yap ve ana sayfaya yönlendir
        login({ 
          id: 0, 
          fullName: 'Misafir Kullanıcı', 
          userId: 'GUEST', 
          familyMembers: 1, 
          status: 'outside-shelter', 
          phoneNumber: 'N/A' 
        });
        router.replace('/(tabs)');
      }
    },
    goBack: () => router.back()
  };

  return (
    <WelcomeScreen 
      language={language} 
      onLanguageChange={setLanguage} 
      navigation={navigationProxy as any} 
    />
  );
}
