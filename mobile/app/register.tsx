import React from 'react';
import RegistrationScreen from '../src/components/RegistrationScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function Register() {
  const { language, setLanguage, setUserData } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string) => {
      if (screen === 'Login') router.push('/login');
      if (screen === 'Home') router.replace('/');
    },
    goBack: () => router.back()
  };

  return (
    <RegistrationScreen 
      language={language} 
      onLanguageChange={setLanguage} 
      onUpdateUser={setUserData}
      navigation={navigationProxy as any} 
    />
  );
}
