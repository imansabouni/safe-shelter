import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  Clock,
  Info,
  MapPin,
  Settings as SettingsIcon
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { UserData } from '../types/user';

const { width, height } = Dimensions.get('window');

interface NotificationItem {
  id: number;
  type: 'emergency' | 'info' | 'system' | 'alert';
  title: string;
  message: string;
  region: string;
  target: string;
  status: string;
  created_at: string;
}

interface NotificationsScreenProps {
  navigation: { goBack: () => void; };
  userData?: UserData;
  language?: 'tr' | 'en' | 'ar';
  markNotificationsRead?: () => void;
}

export default function NotificationsScreen({
  navigation,
  userData,
  language = 'tr',
  markNotificationsRead
}: NotificationsScreenProps) {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const translations = {
    tr: { title: 'Bildirimler', subtitle: 'Son duyurular ve uyarılar', empty: 'Henüz bildirim bulunmuyor.', loading: 'Yükleniyor...' },
    en: { title: 'Notifications', subtitle: 'Latest announcements and alerts', empty: 'No notifications yet.', loading: 'Loading...' },
    ar: { title: 'الإشعارات', subtitle: 'آخر الإعلانات والتنبيهات', empty: 'لا توجد إشعارات بعد.', loading: 'جاري التحميل...' }
  };

  const t = translations[language as keyof typeof translations] || translations.tr;

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markNotificationsRead?.();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle size={20} color="#EF4444" />;
      case 'alert': return <AlertTriangle size={20} color="#F59E0B" />;
      case 'system': return <SettingsIcon size={20} color={isDark ? colors.textSecondary : "#6B7280"} />;
      default: return <Info size={20} color={colors.primary} />;
    }
  };

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#EF4444';
      case 'alert': return '#F59E0B';
      case 'system': return isDark ? colors.textSecondary : '#6B7280';
      default: return colors.primary;
    }
  };

  const getTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9', borderLeftColor: getAccentColor(item.type) }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: getAccentColor(item.type) + '15' }]}>
          {getIcon(item.type)}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{getTimeLabel(item.created_at)}</Text>
            </View>
            <View style={[styles.metaItem, { flex: 1 }]}>
              <MapPin size={12} color={colors.primary} />
              <Text 
                style={[styles.metaText, { color: colors.textSecondary }]} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {item.region || 'Genel'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={[styles.msgBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.05)' : '#F8FAFC', borderColor: 'rgba(30,58,138,0.08)' }]}>
        <Text style={[styles.notificationMsg, { color: colors.textSecondary }]}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header Pattern */}
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
      </View>

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<Text style={styles.subtitle}>{t.subtitle}</Text>}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Bell size={64} color={isDark ? colors.border : "#E2E8F0"} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.empty}</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { position: 'absolute', top: 0, width: '100%', height: height * 0.3, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 20, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#93C5FD', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 25, marginTop: 10 },
  listContent: { padding: 24, paddingTop: 10, paddingBottom: 50 },
  notificationCard: { borderRadius: 28, padding: 20, marginBottom: 16, borderLeftWidth: 6, borderWidth: 1.5, elevation: 4 },
  cardHeader: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationTitle: { fontSize: 16, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '800' },
  msgBox: { padding: 16, borderRadius: 20, borderWidth: 1 },
  notificationMsg: { fontSize: 14, lineHeight: 22, fontWeight: '600' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 100, gap: 15 },
  emptyText: { fontSize: 16, fontWeight: '800' }
});
