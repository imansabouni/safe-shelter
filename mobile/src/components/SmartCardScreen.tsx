import {
  Baby as LucideBaby,
  ChevronLeft as LucideChevronLeft,
  Download as LucideDownload,
  Hash as LucideHash,
  Home as LucideHome,
  MapPin as LucideMapPin,
  PawPrint as LucidePawPrint,
  QrCode as LucideQrCode,
  User as LucideUser,
  Users as LucideUsers
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { UserData } from '../types/user';

// Silencing IDE errors for hybrid environment
const QrCode = LucideQrCode as any;
const User = LucideUser as any;
const Hash = LucideHash as any;
const Home = LucideHome as any;
const Users = LucideUsers as any;
const Baby = LucideBaby as any;
const PawPrint = LucidePawPrint as any;
const Download = LucideDownload as any;
const MapPin = LucideMapPin as any;
const ChevronLeft = LucideChevronLeft as any;

const { width } = Dimensions.get('window');

interface SmartCardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  userData?: UserData;
  language?: 'tr' | 'en' | 'ar';
}

export default function SmartCardScreen({
  navigation,
  userData = {
    fullName: 'Iman Sabouni',
    userId: 'ZRICVS',
    homeAddress: 'Osmanağa Mah. Söğütlüçeşme Cad. No:12',
    assignedShelter: 'Kadıköy Sığınağı',
    shelterRoom: 'Floor 2, Room 104',
    familyMembers: 3,
    status: 'outside-shelter',
    hasChildren: true,
    childrenCount: 2,
    hasPets: false
  } as any,
  language = 'tr'
}: SmartCardScreenProps) {
  const { colors, isDark } = useTheme();
  
  const text = {
    tr: { title: 'Akıllı Kart', subtitle: 'Dijital kimlik kartınız', userId: 'Kullanıcı ID', assignedShelter: 'Atanan Sığınak', room: 'Oda', familyMembers: 'Aile Üyeleri', fullName: 'Ad Soyad', phoneNumber: 'Telefon', homeAddress: 'Ev Adresi', status: 'Durum', scanInfo: 'Bu QR kodu sığınak personeline gösterin', emergencyContact: 'Acil Durum İletişim', member: 'üye', children: 'Çocuklar', pets: 'Evcil Hayvanlar', yes: 'Evet', no: 'Hayır', inside: 'Sığınakta', outside: 'Sığınak Dışında', download: 'İndir', helpText: 'QR kodu kaydedin veya sığınak personeline gösterin' },
    en: { title: 'Smart Card', subtitle: 'Your digital ID card', userId: 'User ID', assignedShelter: 'Assigned Shelter', room: 'Room', familyMembers: 'Family Members', fullName: 'Full Name', phoneNumber: 'Phone', homeAddress: 'Home Address', status: 'Status', scanInfo: 'Show this QR code to shelter staff', emergencyContact: 'Emergency Contact', member: 'member', children: 'Children', pets: 'Pets', yes: 'Yes', no: 'No', inside: 'Inside Shelter', outside: 'Outside Shelter', download: 'Download', helpText: 'Save QR code or show to shelter staff' },
    ar: { title: 'البطاقة الذكية', subtitle: 'بطاقة الهوية الرقمية', userId: 'معرف المستخدم', assignedShelter: 'المأوى المخصص', room: 'الغرفة', familyMembers: 'أفراد العائلة', fullName: 'الاسم الكامل', phoneNumber: 'الهاتف', homeAddress: 'عنوان المنزل', status: 'الحالة', scanInfo: 'أظهر رمز QR هذا لموظفي المأوى', emergencyContact: 'جهة الاتصال الطارئة', member: 'عضو', children: 'الأطفال', pets: 'الحيوانات الأليفة', yes: 'نعم', no: 'لا', inside: 'داخل المأوى', outside: 'خارج المأوى', download: 'تحميل', helpText: 'احفظ رمز QR أو أظهره لموظفي المأوى' }
  };

  const t = text[language] || text.tr;
  const isRTL = language === 'ar';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#FFF" style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#93C5FD' : '#BFDBFE' }]}>{t.subtitle}</Text>
        </View>

        <View style={styles.mainContent}>
          {/* Main ID Card */}
          <View style={[styles.card, styles.shadow, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatarBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                <LucideUser size={32} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: colors.text }]}>{userData.fullName}</Text>
                <Text style={[styles.userAddr, { color: colors.textSecondary }]} numberOfLines={1}>{userData.homeAddress}</Text>
              </View>
            </View>

            {/* QR Section */}
            <View style={styles.qrSection}>
              <View style={[styles.qrWrapper, styles.shadow, { backgroundColor: '#FFF' }]}>
                <QrCode size={180} color="#111827" />
              </View>
              <Text style={[styles.qrInfo, { color: colors.textSecondary }]}>{t.scanInfo}</Text>
            </View>

            {/* Statistics Row */}
            <View style={styles.statsRow}>
              <DetailRow icon={Hash} label={t.userId} value={userData.userId} />
              <DetailRow icon={MapPin} label={t.assignedShelter} value={userData.assignedShelter} />
              <DetailRow icon={Home} label={t.room} value={userData.shelterRoom} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.extraStats}>
              <DetailRow icon={Users} label={t.familyMembers} value={`${userData.familyMembers} ${t.member}`} />
              <DetailRow
                icon={Baby}
                label={t.children}
                value={userData.hasChildren ? `${t.yes} (${userData.childrenCount})` : t.no}
              />
              <DetailRow icon={PawPrint} label={t.pets} value={userData.hasPets ? t.yes : t.no} />
              <DetailRow
                icon={User}
                label={t.status}
                value={userData.status === 'inside-shelter' ? t.inside : t.outside}
                highlight={userData.status === 'inside-shelter'}
              />
            </View>

            {/* Action Bar */}
            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
              <Download size={20} color={colors.primary} />
              <Text style={[styles.downloadText, { color: colors.primary }]}>{t.download}</Text>
            </TouchableOpacity>
          </View>

          {/* Help Box */}
          <View style={[styles.helpBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)' }]}>
            <Text style={styles.helpText}>{t.helpText}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon: Icon, label, value, highlight = false }: any) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.detailItem}>
      <View style={[styles.detailIcon, { backgroundColor: highlight ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE') : (isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6') }]}>
        <Icon size={18} color={highlight ? colors.primary : colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: highlight ? colors.primary : colors.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginLeft: -10, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 16, fontWeight: '500' },
  mainContent: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { borderRadius: 32, padding: 24, marginTop: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  avatarBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  userAddr: { fontSize: 13 },
  qrSection: { alignItems: 'center', marginBottom: 32 },
  qrWrapper: { padding: 20, borderRadius: 24, marginBottom: 16 },
  qrInfo: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  statsRow: { gap: 16 },
  divider: { height: 1, marginVertical: 20 },
  extraStats: { gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
  detailValue: { fontSize: 15, fontWeight: '800' },
  downloadBtn: { marginTop: 30, height: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  downloadText: { fontWeight: '800', fontSize: 16 },
  helpBox: { marginTop: 24, padding: 20, borderRadius: 24, alignItems: 'center' },
  helpText: { color: '#FFF', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 22 },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 5 }
    })
  }
});