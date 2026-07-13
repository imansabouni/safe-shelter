import React from 'react';
import LoginScreen from '../src/components/LoginScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function Login() {
  const { language, setLanguage, setUserData } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string) => {
      if (screen === 'Home' || screen === '/(tabs)') router.replace('/');
      if (screen === 'Register' || screen === 'Registration') router.push('/register');
    },
    goBack: () => router.back()
  };

  return (
    <LoginScreen 
      language={language} 
      onLanguageChange={setLanguage} 
      onUpdateUser={setUserData}
      onLogin={(data) => navigationProxy.navigate('Home')}
      navigation={navigationProxy as any} 
    />
  );
}
