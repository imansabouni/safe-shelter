import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle as LucideAlertTriangle,
  Bell as LucideBell,
  BookOpen as LucideBookOpen,
  CheckCircle as LucideCheckCircle,
  ChevronRight as LucideChevronRight,
  CreditCard as LucideCreditCard,
  ExternalLink as LucideExternalLink,
  Globe as LucideGlobe,
  GraduationCap as LucideGraduationCap,
  Heart as LucideHeart,
  Home as LucideHome,
  Info as LucideInfo,
  LogOut as LucideLogOut,
  Map as LucideMap,
  MapPin as LucideMapPin,
  Menu as LucideMenu,
  Navigation as LucideNavigation,
  Newspaper as LucideNewspaper,
  Scan as LucideScan,
  Settings as LucideSettings,
  ShieldAlert as LucideShieldAlert,
  ShieldCheck as LucideShieldCheck,
  Sparkles as LucideSparkles,
  Star as LucideStar,
  User as LucideUser,
  Users as LucideUsers,
  WifiOff as LucideWifiOff,
  Zap as LucideZap
} from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { UserData } from '../types/user';
import { useIsFocused } from '@react-navigation/native';

const Bell = LucideBell as any;
const MapPin = LucideMapPin as any;
const CreditCard = LucideCreditCard as any;
const Users = LucideUsers as any;
const Map = LucideMap as any;
const BookOpen = LucideBookOpen as any;
const WifiOff = LucideWifiOff as any;
const Navigation = LucideNavigation as any;
const AlertTriangle = LucideAlertTriangle as any;
const CheckCircle = LucideCheckCircle as any;
const Globe = LucideGlobe as any;
const Home = LucideHome as any;
const GraduationCap = LucideGraduationCap as any;
const Settings = LucideSettings as any;
const Scan = LucideScan as any;
const Menu = LucideMenu as any;
const LogOut = LucideLogOut as any;
const Sparkles = LucideSparkles as any;
const Newspaper = LucideNewspaper as any;
const Star = LucideStar as any;
const Heart = LucideHeart as any;
const ChevronRight = LucideChevronRight as any;
const UserIcon = LucideUser as any;
const Zap = LucideZap as any;
const ExternalLink = LucideExternalLink as any;
const ShieldAlert = LucideShieldAlert as any;
const Info = LucideInfo as any;
const ShieldCheck = LucideShieldCheck as any;

import api from '../api/api';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  userData?: any;
  language?: 'tr' | 'en' | 'ar';
  onLanguageChange: (lang: 'tr' | 'en' | 'ar') => void;
  onLogout: () => void;
  hasUnread?: boolean;
  markNotificationsRead?: (latestId?: number) => void;
}

export default function HomeScreen({ 
  navigation, 
  userData,
  language = 'tr',
  onLanguageChange = () => {},
  hasUnread = false,
  markNotificationsRead = () => {},
  onLogout = () => {}
}: HomeScreenProps) {
  const { colors, isDark } = useTheme();
  const { hasPromptedHealth, setHasPromptedHealth, setUserData } = useApp();
  const isFocused = useIsFocused();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showHealthModal, setShowHealthModal] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(width)).current;

  const [nearestShelter, setNearestShelter] = React.useState<any>(null);

  React.useEffect(() => {
    // Uygulama açıldıktan 1.5 saniye sonra sağlık durumunu sor
    if (!hasPromptedHealth && userData) {
      const timer = setTimeout(() => {
        setShowHealthModal(true);
        setHasPromptedHealth(true);
      }, 300); // Gecikmeyi 1.5s'den 0.3s'ye indirdik, artık anında çıkacak
      return () => clearTimeout(timer);
    }
  }, [userData?.id]);

  React.useEffect(() => {
    if (isFocused && userData?.card_id && setUserData) {
      api.get(`cards/${userData.card_id}`).then(res => {
        if (res.data.success) {
          const me = res.data.card.members.find((m: any) => m.id === userData.id);
          if (me) {
            const dbStatus = me.status === 'inside' ? 'inside-shelter' : 'outside-shelter';
            const currentShelterName = me.shelter?.name || '';
            if (dbStatus !== userData.status || currentShelterName !== (userData.assignedShelter || '')) {
              setUserData({ ...userData, status: dbStatus, assignedShelter: currentShelterName });
            }
          }
        }
      }).catch(err => console.log('Home status sync error:', err));
    }
  }, [isFocused, userData?.card_id, userData?.status, userData?.assignedShelter]);

  // Sığınakları çek ve en yakınını bul (Özellikle misafirler için)
  React.useEffect(() => {
    const fetchAndFindNearest = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('Location services are disabled.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        
        // Sığınakları API'den çek
        const response = await api.get('shelters');
        const shelters = response.data?.shelters || (Array.isArray(response.data) ? response.data : []);
        
        if (shelters.length > 0) {
          let minDistance = Infinity;
          let closest = null;

          shelters.forEach((s: any) => {
            const dist = calculateDistance(loc.coords.latitude, loc.coords.longitude, parseFloat(s.lat), parseFloat(s.lng));
            if (dist < minDistance) {
              minDistance = dist;
              closest = {
                ...s,
                distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`
              };
            }
          });

          if (closest) {
            setNearestShelter(closest);
          }
        }
      } catch (error) {
        console.log('Error fetching nearest shelter:', error);
      }
    };

    fetchAndFindNearest();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  React.useEffect(() => {
    let intervalId: any;

    const syncLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && userData?.user_code && userData?.id !== 0) {
          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) {
            console.log('Location services are disabled.');
            return;
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          await api.post('/location/update', {
            user_code: userData.user_code,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude
          });
          console.log('Continuous Location Auto-Synced');
        }
      } catch (error) {
        console.log('Location sync error (silenced):', error);
      }
    };

    // İlk açılışta hemen gönder
    syncLocation();

    // Sonra her 15 saniyede bir sessizce gönder (Sürekli Takip)
    intervalId = setInterval(() => {
      syncLocation();
    }, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userData?.user_code]);
  React.useEffect(() => {
    if (showMenu) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.poly(4)),
      }).start();
    }
  }, [showMenu]);

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowMenu(false));
  };

  const updateHealthStatus = async (status: string) => {
    // Kullanıcı deneyimini hızlandırmak için modalı hemen kapatıyoruz (Optimistic UI)
    setShowHealthModal(false);
    
    // Misafir kullanıcılar (GUEST) için veritabanında bir kayıt olmadığı için API isteği göndermiyoruz
    if (!userData?.id || userData?.userId === 'GUEST') {
      return;
    }

    try {
      await api.post('/card/health-status', {
        card_member_id: userData?.id,
        health_status: status
      });
    } catch (error) {
      console.log('Health status update error (silenced):', error);
      // Arka planda hata oluşsa bile kullanıcıya yansıtmıyoruz ki akış bozulmasın
    }
  };

  const text = {
    tr: { 
      welcome: 'Hoş geldiniz', 
      currentStatus: 'Mevcut Durum', 
      healthTitle: 'Güvenlik ve Sağlık Kontrolü',
      healthQuestion: 'Güvende misiniz? Herhangi bir desteğe veya yardıma ihtiyacınız var mı?',
      healthGood: 'GÜVENDEYİM / İYİYİM',
      healthBad: 'DESTEK LAZIM',
      insideShelter: 'Sığınaktayım', 
      outsideShelter: 'Sığınak Dışındayım', 
      smartCardSummary: 'Dijital Kart Özeti', 
      cardNumber: 'Kod Numarası', 
      familyMembers: 'Aile Üyeleri', 
      viewCard: 'Kartı Görüntüle', 
      nearestShelter: 'En Yakın Sığınak', 
      distance: 'Mesafe', 
      capacity: 'Kapasite', 
      open: 'Açık', 
      full: 'Dolu', 
      closed: 'Kapalı', 
      getDirections: 'Yol Tarifi Al', 
      alternative: 'Alternatif Sığınak Öner', 
      quickActions: 'Hızlı Erişim', 
      sheltersMap: 'Sığınak Haritası', 
      qrScanner: 'QR Okut', 
      sos: 'SOS Yardım', 
      family: 'Aile', 
      safetyGuidance: 'Güvenlik Rehberi', 
      offlineMode: 'Çevrimdışı Mod', 
      emergencyAlert: 'Acil Durum Uyarısı', 
      alertMessage: 'Resmi kanallardan güncellemeleri takip edin.', 
      offlineAccess: 'İnternetsiz bilgilere erişin', 
      members: 'üye', 
      latestNews: 'Son Haberler', 
      newAlerts: 'Yeni Duyuru', 
      menu: 'Menü', 
      donations: 'Bağış Yap', 
      notifications: 'Bildirimler', 
      settings: 'Ayarlar', 
      feedback: 'Görüş Bildir', 
      logout: 'Çıkış Yap' 
    },
    en: { welcome: 'Welcome', healthTitle: 'Health Status Check', healthQuestion: 'How are you feeling today?', healthGood: 'I AM OKAY', healthBad: 'I NEED HELP', currentStatus: 'Status', insideShelter: 'Inside', outsideShelter: 'Outside', smartCardSummary: 'Digital Card Info', cardNumber: 'Code Number', familyMembers: 'Family', viewCard: 'View', nearestShelter: 'Nearest Shelter', distance: 'Dist', capacity: 'Cap', open: 'Open', full: 'Full', closed: 'Closed', getDirections: 'Directions', alternative: 'Alt Shelter', quickActions: 'Actions', sheltersMap: 'Map', qrScanner: 'QR Scan', sos: 'SOS', family: 'Family', safetyGuidance: 'Safety', offlineMode: 'Offline', emergencyAlert: 'Alert', alertMessage: 'Follow updates.', offlineAccess: 'Offline info', members: 'members', latestNews: 'Latest News', newAlerts: 'New Alerts', menu: 'Menu', donations: 'Donations', notifications: 'Notifications', settings: 'Settings', feedback: 'Feedback', logout: 'Logout' },
    ar: { welcome: 'مرحباً', healthTitle: 'فحص الحالة الصحية', healthQuestion: 'كيف تشعر اليوم؟', healthGood: 'أنا بخير', healthBad: 'أحتاج للمساعدة', currentStatus: 'الحالة', insideShelter: 'داخل', outsideShelter: 'خارج', smartCardSummary: 'ملخص البطاقة الرقمية', cardNumber: 'رقم الكود', familyMembers: 'العائلة', viewCard: 'عرض', nearestShelter: 'أقرب مأوى', distance: 'المسافة', capacity: 'السعة', open: 'مفتوح', full: 'ممتلئ', closed: 'مغلق', getDirections: 'الاتجاهات', alternative: 'بديل', quickActions: 'إجراءات', sheltersMap: 'الخريطة', qrScanner: 'QR مسح', sos: 'SOS', family: 'العائلة', safetyGuidance: 'إرشادات', offlineMode: 'بدون اتصال', emergencyAlert: 'تنبيه', alertMessage: 'تابع التحديثات.', offlineAccess: 'معلومات', members: 'أأعضاء', latestNews: 'آخر الأخبار', newAlerts: 'تنبيهات جديدة', menu: 'القائمة', donations: 'تبرعات', notifications: 'إشعارات', settings: 'إعدادات', feedback: 'رأيك يهمنا', logout: 'تسجيل خروج' }
  };

  const t = text[language] || text.tr;
  const isInside = userData?.status === 'inside-shelter';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Geliştirilmiş Arka Plan (Işıltı Efektli) */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -80, left: -80, width: 220, height: 220 }]} />
        <View style={[styles.headerGlow, { bottom: -40, right: -60, width: 180, height: 180 }]} />
      </View>
      
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => navigation.navigate('Friends')}>
          <Users size={20} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navIconBtn} onPress={() => navigation.navigate('AIAssistant')}>
            <Sparkles size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn} onPress={() => setShowMenu(true)}>
            <Menu size={24} color="#FFF" />
            {hasUnread && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.scrollContent, { flex: 1 }]}>
        
        <View style={styles.identityModule}>
          <View style={[styles.avatarCircle, { backgroundColor: isDark ? colors.surface : '#F0F9FF', borderColor: 'rgba(255,255,255,0.2)' }]}>
            <UserIcon size={32} color={colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>{t.welcome}</Text>
          <Text style={styles.fullName}>{userData?.fullName || 'Misafir'}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: isInside ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7') : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE') }]}>
            <View style={[styles.pulseCircle, { backgroundColor: isInside ? '#10B981' : '#3B82F6' }]} />
            <Text style={[styles.statusBadgeText, { color: isInside ? '#10B981' : (isDark ? '#F9FAFB' : '#1E293B') }]}>
              {userData?.status === 'inside-shelter' 
                ? (userData?.assignedShelter ? `${t.insideShelter} - ${userData.assignedShelter}` : t.insideShelter) 
                : t.outsideShelter}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <TouchableOpacity 
            style={[styles.infoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]} 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={[styles.boxIcon, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#F0F9FF' }]}>
              <CreditCard size={20} color="#4F46E5" />
            </View>
            <View>
              <Text style={[styles.boxLabel, { color: colors.primary }]}>{t.cardNumber}</Text>
              <Text style={[styles.boxValue, { color: colors.text }]}>{userData?.userId || 'GUEST'}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.infoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]} 
            onPress={() => navigation.navigate('News')}
            activeOpacity={0.8}
          >
            <View style={[styles.boxIcon, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#F0F9FF' }]}>
              <Newspaper size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.boxLabel, { color: colors.primary }]}>HABERLER</Text>
              <Text style={[styles.boxValue, { color: colors.text }]} numberOfLines={1}>
                Resmi Duyurular
              </Text>
            </View>
            <ChevronRight size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsGrid}>
          <ActionCard icon={Map} label={t.sheltersMap} color="#3B82F6" onPress={() => navigation.navigate('SheltersMap')} />
          <ActionCard icon={Scan} label={t.qrScanner} color="#10B981" onPress={() => navigation.navigate('QRScanner')} />
          <ActionCard icon={AlertTriangle} label={t.sos} color="#EF4444" onPress={() => navigation.navigate('SOS')} />
          <ActionCard icon={Users} label={t.family} color="#8B5CF6" onPress={() => navigation.navigate('Family')} />
        </View>



        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 30 }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('OfflineMap')}
            style={{ flex: 1, borderRadius: 28, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 25 }, android: { elevation: 12 } }) }}
          >
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : ['#1E3A8A', '#1E40AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 14, flexDirection: 'column', justifyContent: 'space-between', height: 110 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 10, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <WifiOff size={14} color="#FFF" />
                  <Home size={14} color="#FFF" />
                </View>
                <View style={{ position: 'absolute', right: 0 }}>
                  <ChevronRight size={14} color="#FFF" opacity={0.6} />
                </View>
              </View>
              <View style={{ width: '100%', marginTop: 4, alignItems: 'center' }}>
                <Text style={{ fontSize: 9.5, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6, marginBottom: 1, textAlign: 'center' }}>İNTERNETSİZ</Text>
                <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, textAlign: 'center' }}>EV HARİTASI</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('OfflineMap', { mapType: 'school' })}
            style={{ flex: 1, borderRadius: 28, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#059669', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 25 }, android: { elevation: 12 } }) }}
          >
            <LinearGradient
              colors={isDark ? ['#065F46', '#022C22'] : ['#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 14, flexDirection: 'column', justifyContent: 'space-between', height: 110 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 10, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <WifiOff size={14} color="#FFF" />
                  <GraduationCap size={14} color="#FFF" />
                </View>
                <View style={{ position: 'absolute', right: 0 }}>
                  <ChevronRight size={14} color="#FFF" opacity={0.6} />
                </View>
              </View>
              <View style={{ width: '100%', marginTop: 4, alignItems: 'center' }}>
                <Text style={{ fontSize: 9.5, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6, marginBottom: 1, textAlign: 'center' }}>İNTERNETSİZ</Text>
                <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, textAlign: 'center' }}>OKUL HARİTASI</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* SAĞLIK DURUMU KONTROL MODALI */}
      <Modal visible={showHealthModal} transparent animationType="fade">
        <View style={styles.healthModalOverlay}>
          <View style={[styles.healthModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : ['#F0F9FF', '#E0F2FE']}
              style={styles.healthHeaderBg}
            >
              <View style={[styles.healthIconCircle, { backgroundColor: colors.primary }]}>
                <Heart size={32} color="#FFF" fill="#FFF" />
              </View>
            </LinearGradient>
            
            <View style={styles.healthBody}>
              <Text style={[styles.healthModalTitle, { color: colors.text }]}>{t.healthTitle}</Text>
              <Text style={[styles.healthModalSub, { color: colors.textSecondary }]}>{t.healthQuestion}</Text>
              
              <View style={styles.healthActionGrid}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.healthStatusBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => updateHealthStatus('İyi')}
                >
                  <CheckCircle size={24} color="#FFF" />
                  <Text style={styles.healthStatusBtnText}>{t.healthGood}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.healthStatusBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => updateHealthStatus('Yardım Gerekiyor')}
                >
                  <AlertTriangle size={24} color="#FFF" />
                  <Text style={styles.healthStatusBtnText}>{t.healthBad}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showMenu} transparent animationType="none">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sidebarTitle, { color: colors.primary }]}>{t.menu}</Text>
            </View>
            <View style={styles.sidebarItems}>
              <MenuLink 
                icon={Globe} 
                label={
                  language === 'tr' ? 'Türkçe' : 
                  language === 'en' ? 'English' : 
                  'العربية'
                } 
                color="#10B981" 
                onPress={() => onLanguageChange(language === 'tr' ? 'en' : (language === 'en' ? 'ar' : 'tr'))} 
              />
              <MenuLink icon={Heart} label={t.donations} color="#EF4444" onPress={() => { closeMenu(); navigation.navigate('Donation'); }} />
              <MenuLink icon={BookOpen} label={t.safetyGuidance} color="#A78BFA" onPress={() => { closeMenu(); navigation.navigate('SafetyGuidance'); }} />
              <MenuLink icon={Bell} label={t.notifications} color="#2563EB" badge={hasUnread} onPress={() => { closeMenu(); markNotificationsRead(); navigation.navigate('Notifications'); }} />
              <MenuLink icon={Settings} label={t.settings} color="#64748B" onPress={() => { closeMenu(); navigation.navigate('Settings'); }} />
              <MenuLink icon={Star} label={t.feedback} color="#F59E0B" onPress={() => { closeMenu(); navigation.navigate('Feedback'); }} />
              <View style={[styles.sidebarDivider, { backgroundColor: colors.border }]} />
              <MenuLink icon={LogOut} label={t.logout} color="#DC2626" onPress={() => { closeMenu(); onLogout(); }} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function ActionCard({ icon: Icon, label, color, onPress }: any) {
  const { colors, isDark } = useTheme();
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]} onPress={onPress}>
      <View style={[styles.acIconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF' }]}>
        <Icon size={28} color={color} />
      </View>
      <Text style={[styles.acLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuLink({ icon: Icon, label, color, onPress, badge = false }: any) {
  const { colors, isDark } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuLink, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]} onPress={onPress}>
      <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#DBEAFE' }]}>
        <Icon size={20} color={color} />
        {badge && <View style={[styles.sidebarBadge, { borderColor: colors.card }]} />}
      </View>
      <Text style={[styles.menuText, { color: colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.45, backgroundColor: '#1E3A8A', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 110, backgroundColor: 'rgba(255, 255, 255, 0.06)' }, 
  scrollContent: { paddingBottom: 40, paddingTop: 80 },
  navHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 45 : 55, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, zIndex: 100 },
  navIconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  navActions: { flexDirection: 'row', gap: 10 },
  badgeDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#1E3A8A' },
  identityModule: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
  welcomeTitle: { color: '#93C5FD', fontSize: 13, fontWeight: '600' },
  fullName: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 15, gap: 8 },
  pulseCircle: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  infoGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 15 },
  infoBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }, android: { elevation: 6 } }) },
  boxIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  boxLabel: { fontSize: 9, color: '#1E3A8A', fontWeight: '800', textTransform: 'uppercase' },
  boxValue: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  moduleTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15, marginLeft: 24 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, marginBottom: 25 },
  actionCard: { width: (width - 60) / 2, backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 }, android: { elevation: 4 } }) },
  acIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  acLabel: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  shelterModule: { marginBottom: 30 },
  shelterHighlight: { marginHorizontal: 24, backgroundColor: '#1E3A8A', borderRadius: 32, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20 }, android: { elevation: 10 } }) },
  shelterTopPart: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  shIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  shName: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  shSub: { color: '#93C5FD', fontSize: 13, marginTop: 2 },
  shTag: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  shTagText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  shFooter: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shFooterText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  offlineContainer: { marginHorizontal: 24, marginBottom: 30, borderRadius: 28, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 25 }, android: { elevation: 12 } }) },
  offlineBanner: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20 },
  offlineGlow: { position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)' },
  offlineIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  offlineTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  offlineActionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  sidebar: { width: width * 0.75, height: '100%', backgroundColor: '#EFF6FF', padding: 24, paddingTop: Platform.OS === 'ios' ? 85 : 75, borderTopLeftRadius: 40, borderBottomLeftRadius: 40, borderWidth: 1, borderColor: '#DBEAFE' },
  sidebarHeader: { marginBottom: 30, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(30, 58, 138, 0.1)' },
  sidebarTitle: { fontSize: 24, fontWeight: '900', color: '#1E3A8A' },
  sidebarItems: { gap: 12 },
  sidebarBadge: { position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#EFF6FF' },
  menuLink: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFF', ...Platform.select({ ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }, android: { elevation: 3 } }) },
  menuIconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuText: { fontSize: 16, fontWeight: '800', color: '#1E3A8A' },
  sidebarDivider: { height: 1, backgroundColor: 'rgba(30, 58, 138, 0.1)', marginVertical: 15 },
  
  // HEALTH MODAL STYLES
  healthModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  healthModalContent: { width: '100%', borderRadius: 40, overflow: 'hidden', borderWidth: 1, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.5, shadowRadius: 25 },
  healthHeaderBg: { height: 120, alignItems: 'center', justifyContent: 'center' },
  healthIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  healthBody: { padding: 30, alignItems: 'center' },
  healthModalTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  healthModalSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30, fontWeight: '600' },
  healthActionGrid: { width: '100%', gap: 15 },
  healthStatusBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  healthStatusBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});