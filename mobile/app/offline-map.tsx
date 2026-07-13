import React from 'react';
import OfflineMapScreen from '../src/components/OfflineMapScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Page() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const navigationProxy = {
    goBack: () => router.back()
  };
  
  const routeProxy = {
    params
  };

  return <OfflineMapScreen navigation={navigationProxy} route={routeProxy} />;
}
