import React from 'react';
import { Alert } from 'react-native';
import HomeScreen from '../../src/components/HomeScreen';
import { useApp } from '../../src/context/AppContext';
import { useAppNavigation } from '../../src/hooks/useAppNavigation';

export default function HomeTabs() {
  const { userData, language, setLanguage, hasUnread, markNotificationsRead, logout } = useApp();
  const navigation = useAppNavigation();

  if (!userData) return null;
 
   return (
     <HomeScreen 
       userData={userData} 
       language={language} 
       hasUnread={hasUnread}
       markNotificationsRead={markNotificationsRead}
       onLanguageChange={setLanguage}
       onLogout={logout}
       navigation={navigation as any} 
     />
   );
 }