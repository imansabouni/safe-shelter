import React from 'react';
import FriendsScreen from '../src/components/FriendsScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Friends() {
  const { userData, language } = useApp();
  const navigation = useAppNavigation();

  return (
    <FriendsScreen 
      userData={userData || undefined} 
      language={language} 
      navigation={navigation as any} 
    />
  );
}
