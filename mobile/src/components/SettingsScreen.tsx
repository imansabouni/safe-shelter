import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Platform, 
  Switch,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Globe as GlobeIcon, 
  Bell as BellIcon, 
  Shield as ShieldIcon, 
  User as UserIcon, 
  Moon as MoonIcon, 
  Wifi as WifiIcon, 
  HelpCircle as HelpCircleIcon, 
  LogOut as LogOutIcon, 
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SettingsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  language?: 'tr' | 'en' | 'ar';
  onLanguageChange?: (lang: 'tr' | 'en' | 'ar') => void;
  userData?: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    age?: string | number;
    address?: string;
  };
  onLogout?: () => void;
}

export default function SettingsScreen({ 
  navigation, 
  language = 'tr', 
  onLanguageChange = () => {}, 
  userData = { 
    fullName: 'Iman Sabouni', 
    phoneNumber: '555 123 4567',
    email: 'iman@example.com',
    age: 28,
    address: 'Osmanağa Mah. Söğütlüçeşme Cad. No:12, Kadıköy'
  }, 
  onLogout = () => navigation.navigate('Login') 
}: SettingsScreenProps) {
  const { colors, toggleTheme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const translations = {
    tr: { title: 'Ayarlar', subtitle: 'Hesap ve uygulama tercihleri', account: 'Hesap Bilgileri', name: 'Ad Soyad', phone: 'Telefon', email: 'E-posta', age: 'Yaş', address: 'Adres', language: 'Dil Seçimi', turkish: 'Türkçe', english: 'English', arabic: 'العربية', notifications: 'Bildirimler', darkMode: 'Karanlık Mod', offline: 'Çevrimdışı Mod', privacy: 'Gizlilik ve Güvenlik', privacyPolicy: 'Gizlilik Politikası', termsOfService: 'Kullanım Şartları', support: 'Yardım ve Destek', helpCenter: 'Yardım Merkezi', logout: 'Çıkış Yap', logoutConfirm: 'Çıkmak istediğinize emin misiniz?', cancel: 'İptal', confirm: 'Evet, Çıkış Yap', version: 'Sürüm' },
    en: { title: 'Settings', subtitle: 'Account and app preferences', account: 'Account Info', name: 'Full Name', phone: 'Phone', email: 'Email', age: 'Age', address: 'Address', language: 'Language', turkish: 'Turkish', english: 'English', arabic: 'Arabic', notifications: 'Notifications', darkMode: 'Dark Mode', offline: 'Offline Mode', privacy: 'Privacy & Security', privacyPolicy: 'Privacy Policy', termsOfService: 'Terms of Service', support: 'Help & Support', helpCenter: 'Help Center', logout: 'Logout', logoutConfirm: 'Are you sure?', cancel: 'Cancel', confirm: 'Logout', version: 'Version' },
    ar: { title: 'الإعدادات', subtitle: 'تفضيلات الحساب والتطبيق', account: 'معلومات الحساب', name: 'الاسم الكامل', phone: 'الهاتف', email: 'البريد الإلكتروني', age: 'العمر', address: 'العنوان', language: 'اختيار اللغة', turkish: 'التركية', english: 'الإنجليزية', arabic: 'العربية', notifications: 'الإشعارات', darkMode: 'الوضع الداكن', offline: 'وضع عدم الاتصال', privacy: 'الخصوصية والأمان', privacyPolicy: 'سياسة الخصوصية', termsOfService: 'شروط الخدمة', support: 'المساعدة والدعم', helpCenter: 'مركز المساعدة', logout: 'تسجيل الخروج', logoutConfirm: 'هل أنت متأكد من تسجيل الخروج؟', cancel: 'إلغاء', confirm: 'تسجيل الخروج', version: 'الإصدار' }
  };

  const t = translations[language as keyof typeof translations] || translations.tr;

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.confirm, style: 'destructive', onPress: onLogout }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header Pattern */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
      </View>

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeftIcon size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.account}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}>
            <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <UserIcon size={32} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: colors.text }]}>{userData.fullName}</Text>
                <Text style={[styles.profileTag, { color: colors.primary }]}>RESMİ KULLANICI</Text>
              </View>
            </View>
            <View style={styles.profileDetails}>
              <ProfileDetail label={t.phone} value={userData.phoneNumber} colors={colors} />
              <ProfileDetail label={t.email} value={userData.email || 'tanımlı değil'} colors={colors} />
              <ProfileDetail label={t.address} value={userData.address || '-'} colors={colors} />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>UYGULAMA AYARLARI</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}>
            <SwitchItem icon={BellIcon} label={t.notifications} value={notificationsEnabled} onValueChange={setNotificationsEnabled} color="#3B82F6" />
            <SwitchItem icon={MoonIcon} label={t.darkMode} value={isDark} onValueChange={toggleTheme} color="#8B5CF6" />
            <SwitchItem icon={WifiIcon} label={t.offline} value={offlineMode} onValueChange={setOfflineMode} color="#10B981" />
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.language}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}>
            <TouchableOpacity style={styles.langItem} onPress={() => onLanguageChange('tr')}>
              <Text style={[styles.langText, { color: colors.text }, language === 'tr' && { color: colors.primary, fontWeight: '900' }]}>{t.turkish}</Text>
              {language === 'tr' && <CheckCircleIcon size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.langItem} onPress={() => onLanguageChange('en')}>
              <Text style={[styles.langText, { color: colors.text }, language === 'en' && { color: colors.primary, fontWeight: '900' }]}>{t.english}</Text>
              {language === 'en' && <CheckCircleIcon size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2' }]} onPress={handleLogout}>
            <LogOutIcon size={22} color="#EF4444" />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: colors.textSecondary }]}>{t.version}: 1.2.0-stable</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileDetail({ label, value, colors }: any) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function SwitchItem({ icon: Icon, label, value, onValueChange, color }: any) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.switchItem, { borderBottomColor: isDark ? colors.border : '#F8FAFC' }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#CBD5E1', true: color }}
        thumbColor="#FFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.3, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 15, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  scrollContent: { paddingBottom: 40, paddingTop: 10 },
  subtitle: { fontSize: 13, color: '#93C5FD', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  section: { paddingHorizontal: 24, marginBottom: 25 },
  sectionHeader: { marginBottom: 12, marginLeft: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  card: { borderRadius: 28, padding: 20, borderWidth: 1.5, elevation: 3 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '900' },
  profileTag: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  profileDetails: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontWeight: '700' },
  detailValue: { fontSize: 13, fontWeight: '800', flex: 1, textAlign: 'right', marginLeft: 20 },
  switchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 15, fontWeight: '700' },
  langItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  langText: { fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 10, paddingHorizontal: 24 },
  logoutBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 64, borderRadius: 20, marginBottom: 20 },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 17 },
  version: { fontSize: 12, fontWeight: '700' }
});