import React from 'react';
import SheltersMapScreen from '../../src/components/SheltersMapScreen';
import { useApp } from '../../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function MapTab() {
  const { userData, language } = useApp();
  const router = useRouter();

  const navigationProxy = {
    navigate: (screen: string, params: any) => {
      if (screen === 'InternalMap') router.push({ pathname: '/internal-map', params });
      if (screen === 'OfflineMode') router.push('/offline-map');
      if (screen === 'Navigation') {
        const serializedParams = params?.shelter ? { ...params, shelter: JSON.stringify(params.shelter) } : params;
        router.push({ pathname: '/navigation', params: serializedParams });
      }
    },
    goBack: () => router.back()
  };

  return (
    <SheltersMapScreen 
      userData={userData ?? undefined} 
      language={language} 
      navigation={navigationProxy as any} 
    />
  );
}
