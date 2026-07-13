import React from 'react';
import NavigationRouteScreen from '../src/components/NavigationRouteScreen';
import { useApp } from '../src/context/AppContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NavigationRoute() {
  const { userData, language } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Expo Router passes params as strings or string arrays. 
  // We need to parse 'shelter' if it's passed as a JSON string, 
  // or just pass the whole params object if the component handles it.
  
  // Looking at NavigationRouteScreen.tsx:
  // const selectedShelter = route?.params?.shelter || userData?.nearestShelter;
  
  const navigationProxy = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'Home') router.replace('/');
      // Add other internal navigations if needed
    },
    goBack: () => router.back()
  };

  // Mocking the 'route' object expected by the component
  const routeProxy = {
    params: {
      ...params,
      shelter: params.shelter ? JSON.parse(params.shelter as string) : null
    }
  };

  return (
    <NavigationRouteScreen 
      userData={userData} 
      language={language} 
      navigation={navigationProxy} 
      route={routeProxy}
    />
  );
}
