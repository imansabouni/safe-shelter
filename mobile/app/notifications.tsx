import React from 'react';
import NotificationsScreen from '../src/components/NotificationsScreen';
import { useApp } from '../src/context/AppContext';
import { useAppNavigation } from '../src/hooks/useAppNavigation';

export default function Notifications() {
  const { userData, language, markNotificationsRead } = useApp();
  const navigation = useAppNavigation();

  return (
    <NotificationsScreen 
      userData={userData || undefined} 
      language={language} 
      markNotificationsRead={markNotificationsRead}
      navigation={navigation as any} 
    />
  );
}
