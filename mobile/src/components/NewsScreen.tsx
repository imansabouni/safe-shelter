import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Platform,
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft as LucideChevronLeft,
  Globe as LucideGlobe,
  Cloud as LucideCloud,
  Activity as LucideActivity,
  Shield as LucideShield,
  Tv as LucideTv,
  ArrowUpRight,
  Zap
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ChevronLeft = LucideChevronLeft as any;
const Globe = LucideGlobe as any;
const Cloud = LucideCloud as any;
const Activity = LucideActivity as any;
const Shield = LucideShield as any;
const Tv = LucideTv as any;

export default function NewsScreen({ navigation, language = 'tr' }: any) {
  const { colors, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Resmi');

  const categories = [
    { id: 'Resmi', label: 'Resmi Kanallar' },
    { id: 'Hava', label: 'Hava Durumu' },
    { id: 'Sağlık', label: 'Sağlık & Yardım' },
  ];

  const officialLinks = [
    { id: 'afad', title: 'AFAD | Afet Duyuruları', desc: 'Resmi afet ve acil durum bilgilendirmeleri, güncel duyurular ve uyarılar.', url: 'https://www.afad.gov.tr/duyurular', category: 'Resmi', icon: Shield, inst: 'T.C. AFAD', color: '#EF4444' },
    { id: 'trthaber', title: 'TRT Haber | Canlı Yayın', desc: 'Dakika dakika güncel gelişmeler ve resmi haber akışı.', url: 'https://www.trthaber.com/canli-yayin-izle.html', category: 'Resmi', icon: Tv, inst: 'TRT Haber', color: colors.primary },
    { id: 'mgm', title: 'MGM | Hava Durumu', desc: 'Meteoroloji Genel Müdürlüğü anlık uyarıları ve bölgesel tahminler.', url: 'https://mgm.gov.tr', category: 'Hava', icon: Cloud, inst: 'Meteoroloji', color: '#0EA5E9' },
    { id: 'kizilay', title: 'Kızılay | Kan Bağışı', desc: 'Acil kan ihtiyaç stokları ve güncel yardım operasyonları.', url: 'https://www.kizilay.org.tr', category: 'Sağlık', icon: Activity, inst: 'Türk Kızılay', color: '#EF4444' },
    { id: 'ahbap', title: 'AHBAP | Yardımlaşma', desc: 'Toplumsal yardımlaşma ve dayanışma projeleri, acil destek.', url: 'https://ahbap.org', category: 'Sağlık', icon: Activity, inst: 'Ahbap Derneği', color: '#10B981' }
  ];

  const translations: any = {
    tr: { title: 'Bilgi Kanalları', subtitle: 'Resmi ve Doğrulanmış Kaynaklar', official: 'RESMİ BAĞLANTI', open: 'Kaynağa Git' },
    en: { title: 'News Channels', subtitle: 'Official & Verified Sources', official: 'OFFICIAL LINK', open: 'Open Source' }
  };
  const t = translations[language] || translations.tr;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
        
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 40 }}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.catChip, activeCategory === cat.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: '#FFF', borderColor: '#E2E8F0' }]} 
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.catText, { color: activeCategory === cat.id ? '#FFF' : '#64748B' }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {officialLinks.filter(l => l.category === activeCategory).map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}
            onPress={() => Linking.openURL(item.url)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.instLabel, { color: item.color }]}>{item.inst}</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              </View>
              <View style={styles.arrowBox}>
                <ArrowUpRight size={20} color={colors.primary} />
              </View>
            </View>
            
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            
            <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.border : '#F1F5F9' }]}>
              <View style={styles.officialBadge}>
                <LucideShield size={12} color="#10B981" />
                <Text style={styles.officialText}>{t.official}</Text>
              </View>
              <Text style={[styles.openText, { color: colors.primary }]}>{t.open} ➔</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.26, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: '#DBEAFE', fontWeight: '700', textAlign: 'center', opacity: 0.9 },
  categoryContainer: { paddingHorizontal: 24, marginTop: -25, marginBottom: 20 },
  catChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  catText: { fontSize: 13, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50 },
  card: { borderRadius: 28, padding: 18, marginBottom: 16, borderWidth: 1.5, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  instLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  arrowBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(30,58,138,0.05)', alignItems: 'center', justifyContent: 'center' },
  cardDesc: { fontSize: 13, lineHeight: 20, marginBottom: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1.5 },
  officialBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  officialText: { fontSize: 10, fontWeight: '900', color: '#10B981', letterSpacing: 0.5 },
  openText: { fontSize: 12, fontWeight: '900' }
});
