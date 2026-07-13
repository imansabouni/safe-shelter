import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();

  const navigate = (screen: string, params?: any) => {
    console.log('Global Navigating to:', screen);
    
    // Normalize names to match expectation
    const screenLower = screen.toLowerCase();

    if (screen === 'Home') {
      router.replace('/(tabs)' as any);
      return;
    }
    if (screen === 'Welcome' || screen === 'Login') {
      router.replace('/login' as any);
      return;
    }
    if (screenLower.includes('shelter') || screen === 'Sığınak' || screen === 'Sığınaklar' || screen === 'Barınak' || screen === 'Barınaklar' || screen === 'SheltersMap' || screen === 'map') {
      router.push('/map' as any);
      return;
    }
    if (screenLower.includes('qr') || screen === 'Scan') {
      router.push('/qr' as any);
      return;
    }
    if (screenLower.includes('profile') || screen === 'SmartCard') {
      router.push('/profile' as any);
      return;
    }
    if (screenLower.includes('notification')) {
      router.push('/notifications' as any);
      return;
    }
    if (screenLower.includes('ai') || screenLower.includes('assistant')) {
      router.push('/ai-assistant' as any);
      return;
    }
    if (screen === 'Friends') {
      router.push('/friends' as any);
      return;
    }
    if (screen === 'SOS') {
      router.push('/sos' as any);
      return;
    }
    if (screen === 'Settings') {
      router.push('/settings' as any);
      return;
    }
    if (screen === 'SafetyGuidance') {
      router.push('/safety-guidance' as any);
      return;
    }
    if (screen === 'OfflineMode' || screen === 'OfflineMap') {
      const routeParams = { ...params };
      router.push({ pathname: '/offline-map', params: routeParams } as any);
      return;
    }
    if (screen === 'News') {
      router.push('/news' as any);
      return;
    }
    if (screen === 'Donation') {
      router.push('/donation' as any);
      return;
    }
    if (screen === 'Family') {
      router.push('/family' as any);
      return;
    }
    if (screen === 'Feedback') {
      router.push('/feedback' as any);
      return;
    }
    if (screen === 'InternalMap') {
      router.push('/internal-map' as any);
      return;
    }
    if (screen === 'Navigation') {
      const routeParams = { ...params };
      if (routeParams.shelter && typeof routeParams.shelter === 'object') {
        routeParams.shelter = JSON.stringify(routeParams.shelter);
      }
      router.push({ pathname: '/navigation', params: routeParams } as any);
      return;
    }
  };

  const goBack = () => router.back();

  return { navigate, goBack };
}
