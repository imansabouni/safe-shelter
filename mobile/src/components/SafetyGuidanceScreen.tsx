import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen as LucideBookOpen,
  AlertTriangle as LucideAlertTriangle,
  Package as LucidePackage,
  Baby as LucideBaby,
  Home as LucideHome,
  CheckCircle as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ChevronLeft = LucideChevronLeft as any;
const CheckCircle = LucideCheckCircle as any;
const AlertTriangle = LucideAlertTriangle as any;
const PackageIcon = LucidePackage as any;
const HomeIcon = LucideHome as any;

const { width, height } = Dimensions.get('window');

interface SafetyGuidanceScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  language?: 'tr' | 'en' | 'ar';
}

export default function SafetyGuidanceScreen({
  navigation,
  language = 'tr'
}: SafetyGuidanceScreenProps) {
  const { colors, isDark } = useTheme();

  const t = {
    tr: {
      title: 'Güvenlik Rehberi',
      subtitle: 'Uzman AFAD ve AKUT protokolleri',
      beforeQuake: 'Hazırlık & Planlama',
      duringQuake: 'Kriz Yönetimi (0-60 Sn)',
      afterQuake: 'Tahliye & Güvenlik',
      emergencyKit: 'Profesyonel Afet Çantası',
      readyTitle: 'Afete Hazır mısın?'
    }
  }['tr'];

  const beforeSteps = [
    'Yapısal riskleri analiz edin ve mobilyaları L-braket ile sabitleyin.',
    'Aile afet planı yapın ve toplanma noktasını belirleyin.',
    'Acil durum çantasını her zaman erişilebilir bir yerde tutun.',
    'Şebeke vanalarının yerlerini öğrenin ve nasıl kapatılacağını pratik edin.',
    'Binaların deprem yönetmeliğine uygunluğunu kontrol ettirin.'
  ];
  const duringSteps = [
    'Sakin kalın ve cam cephelerden, ağır devrilebilir dolaplardan uzak durun.',
    'Sağlam bir eşyanın yanında "Çök-Kapan-Tutun" pozisyonu alın.',
    'Asansör ve merdivenleri kesinlikle kullanmayın, oldukları yerde durun.',
    'Baş ve boyun bölgenizi darbelere karşı kolunuzla veya yastıkla koruyun.',
    'Sarsıntı tamamen bitene kadar güvenli pozisyonda bekleyin.'
  ];
  const afterSteps = [
    'Kendinizi ve çevrenizdekileri yaralanma açısından kontrol edin.',
    'Şebeke vanalarını (Gaz, Su, Elektrik) sızıntı riskine karşı kapatın.',
    'Gaz kokusu varsa asla fener dışında ışık kaynağı veya ateş kullanmayın.',
    'Planlı tahliye rotasını izleyerek binayı emniyetli şekilde terk edin.',
    'Alt yapı hasarlarına karşı dikkatli olun ve SMS/İnternet ile haberleşin.'
  ];

  const [checklist, setChecklist] = React.useState([false, false, false, false, false]);
  const checklistItems = [
    'Ağır mobilyalar L-braket ile duvara sabitlendi.',
    'Kapsamlı acil durum afet çantası hazırlandı.',
    'Aile tahliye planı yapıldı ve toplanma noktası belirlendi.',
    'Gaz, su ve elektrik vanalarının kapatılması öğrenildi.',
    'Konutun deprem yönetmeliğine uygunluğu test edildi.'
  ];

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

        <View style={styles.readyBadge}>
          <LucideBookOpen size={20} color="#FFF" />
          <Text style={styles.readyBadgeText}>BİLGİ HAYAT KURTARIR</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Readiness Checklist */}
        <View style={[styles.checklistCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : colors.primary }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.checklistTitle, { color: colors.primary }]}>{t.readyTitle}</Text>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.checklistBody}>
            {checklistItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.checkRow}
                onPress={() => {
                  const newChecklist = [...checklist];
                  newChecklist[index] = !newChecklist[index];
                  setChecklist(newChecklist);
                }}
              >
                <View style={[styles.customCheck, { backgroundColor: colors.background, borderColor: colors.primary }, checklist[index] && { backgroundColor: colors.primary }]}>
                  {checklist[index] && <CheckCircle size={14} color="#FFF" />}
                </View>
                <Text style={[styles.checkText, { color: colors.text }, checklist[index] && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sections */}
        <SectionCard
          icon={AlertTriangle}
          title={t.beforeQuake}
          color={colors.primary}
          items={beforeSteps}
        />
        <SectionCard
          icon={AlertTriangle}
          title={t.duringQuake}
          color={colors.primary}
          items={duringSteps}
        />
        <SectionCard
          icon={HomeIcon}
          title={t.afterQuake}
          color={colors.primary}
          items={afterSteps}
        />

        {/* Kit Section */}
        <View style={[styles.kitCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : colors.primary }]}>
          <View style={styles.kitHeader}>
            <View style={[styles.kitIconBox, { backgroundColor: colors.primary }]}>
              <PackageIcon size={24} color="#FFF" />
            </View>
            <Text style={[styles.kitTitle, { color: colors.text }]}>{t.emergencyKit}</Text>
          </View>
          <View style={styles.kitContent}>
            {[
              'Yüksek kalorili, uzun ömürlü konserve gıdalar',
              'Kişi başı günlük 3-4 litre içme suyu',
              'Radyo (Pilli veya dinamolu) + Yedek Piller',
              'Kapsamlı ilkyardım ve ilaç envanteri',
              'Isı yalıtımlı acil durum battaniyesi (Foil)',
              'Çok fonksiyonlu çakı ve iş eldiveni',
              'Kimlik fotokopileri ve bir miktar nakit para'
            ].map((kit, idx) => (
              <Text key={idx} style={[styles.kitItem, { color: colors.textSecondary }]}>• {kit}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ icon: Icon, title, color, items }: any) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : color }]}>
      <View style={[styles.cardHeader, { backgroundColor: color }]}>
        <Icon size={20} color="#FFF" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        {items.map((item: string, index: number) => (
          <View key={index} style={styles.stepRow}>
            <View style={[styles.stepCircle, { borderColor: color }]}>
              <Text style={[styles.stepNumber, { color: color }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.26, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  readyBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  readyBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 50, gap: 24 },
  card: { borderRadius: 32, overflow: 'hidden', borderWidth: 1 },
  cardHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  cardBody: { padding: 24, gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumber: { fontSize: 14, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 22 },
  kitCard: { borderRadius: 32, padding: 24, borderWidth: 1 },
  kitHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  kitIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  kitTitle: { fontSize: 20, fontWeight: '900' },
  kitContent: { gap: 10 },
  kitItem: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  checklistCard: { borderRadius: 32, padding: 24, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sectionLine: { flex: 1, height: 1 },
  checklistTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  checklistBody: { gap: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  customCheck: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, fontSize: 14, fontWeight: '700' }
});