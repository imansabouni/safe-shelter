import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Platform,
  Dimensions
} from 'react-native';
import { 
  Wifi as LucideWifi, 
  WifiOff as LucideWifiOff, 
  CheckCircle as LucideCheckCircle, 
  RefreshCw as LucideRefreshCw 
} from 'lucide-react-native';

// Silencing IDE errors for hybrid environment
const Wifi = LucideWifi as any;
const WifiOff = LucideWifiOff as any;
const CheckCircle = LucideCheckCircle as any;
const RefreshCw = LucideRefreshCw as any;

const { width } = Dimensions.get('window');

interface OnlineStatusNotificationProps {
  language: 'tr' | 'en' | 'ar';
}

export default function OnlineStatusNotification({ language = 'tr' }: OnlineStatusNotificationProps) {
  // In a real native app, we would use NetInfo. 
  // For this prototype, we'll keep the logic and mock the online state.
  const [isOnline, setIsOnline] = useState(true); 
  const [showNotification, setShowNotification] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const content = {
    tr: { online: 'Çevrimiçi', offline: 'Çevrimdışı', onlineMessage: 'İnternet bağlantısı yeniden kuruldu', offlineMessage: 'İnternet bağlantısı kesildi. Çevrimdışı moddasınız.', syncing: 'Senkronize ediliyor...', syncComplete: 'Senkronizasyon tamamlandı', syncCompleteDesc: 'Tüm veriler güncellendi' },
    en: { online: 'Online', offline: 'Offline', onlineMessage: 'Internet connection restored', offlineMessage: 'No internet connection. Offline mode enabled.', syncing: 'Syncing...', syncComplete: 'Sync Complete', syncCompleteDesc: 'All data updated' },
    ar: { online: 'متصل', offline: 'غير متصل', onlineMessage: 'تم استعادة الاتصال بالإنترنت', offlineMessage: 'لا يوجد اتصال بالإنترنت. وضع عدم الاتصال مفعل.', syncing: 'جاري المزامنة...', syncComplete: 'اكتملت المزامنة', syncCompleteDesc: 'تم تحديث جميع البيانات' }
  };

  const t = content[language] || content.tr;

  const animateIn = () => {
    setShowNotification(true);
    Animated.spring(slideAnim, {
      toValue: Platform.OS === 'ios' ? 60 : 40,
      useNativeDriver: true,
      bounciness: 8
    }).start();
  };

  const animateOut = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 500,
      useNativeDriver: true
    }).start(() => setShowNotification(false));
  };

  // Simulation effect for demo
  useEffect(() => {
    // Initial entrance hint for the demo if needed
    setTimeout(() => {
      // animateIn();
      // setTimeout(animateOut, 5000);
    }, 2000);
  }, []);

  if (!showNotification) return null;

  const isSuccess = isOnline && syncComplete;
  const isWarning = !isOnline;

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY: slideAnim }] },
      isWarning && styles.warningBg,
      isSyncing && styles.syncBg,
      isSuccess && styles.successBg
    ]}>
      <View style={styles.iconBox}>
        {!isOnline ? (
          <WifiOff size={20} color="#EF4444" />
        ) : isSyncing ? (
          <RefreshCw size={20} color="#3B82F6" />
        ) : (
          <CheckCircle size={20} color="#10B981" />
        )}
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>
          {!isOnline ? t.offline : isSyncing ? t.syncing : t.syncComplete}
        </Text>
        <Text style={styles.desc}>
          {!isOnline ? t.offlineMessage : isSyncing ? t.syncing : t.syncCompleteDesc}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 }
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  warningBg: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  syncBg: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  successBg: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  textBox: { flex: 1 },
  title: { fontSize: 12, fontWeight: '900', color: '#111827', marginBottom: 1 },
  desc: { fontSize: 10, color: '#6B7280', fontWeight: '600' }
});
