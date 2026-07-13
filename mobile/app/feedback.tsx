import React from 'react';
import FeedbackScreen from '../src/components/FeedbackScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';

import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Feedback() {
  const { language } = useApp();
  const navigation = useAppNavigation();

  return (
    <FeedbackScreen 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
