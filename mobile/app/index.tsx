import React from 'react';
import { useRouter } from 'expo-router';
import IntroSplashScreen from '../src/components/IntroSplashScreen';

export default function Index() {
  const router = useRouter();

  const handleFinish = () => {
    // Redirect to login after the intro
    router.replace('/login');
  };

  return <IntroSplashScreen onFinish={handleFinish} />;
}
