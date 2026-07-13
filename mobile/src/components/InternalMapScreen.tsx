import { useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Baby,
  Bed,
  Cat,
  ChevronLeft,
  Church,
  DoorOpen,
  Activity as HeartPulse,
  Info,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Stethoscope,
  Users
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
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
import { UserData } from '../types/user';

const { width, height } = Dimensions.get('window');

const ChevronLeftIcon = ChevronLeft as any;

interface InternalMapScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  userData: UserData;
  language: 'tr' | 'en' | 'ar';
  route: { params: { shelterName?: string } };
}

export default function InternalMapScreen({
  navigation,
  userData,
  language = 'tr',
  route
}: InternalMapScreenProps) {
  const { colors, isDark } = useTheme();
  const searchParams = useLocalSearchParams() as any;
  const routeParams = (route?.params as any) || {};

  const rawNameFromAllSources =
    searchParams.shelterName ||
    routeParams.shelterName ||
    searchParams.params?.shelterName ||
    routeParams.params?.shelterName ||
    '';

  const shelterName = React.useMemo(() => {
    let name = rawNameFromAllSources;
    if (!name) return language === 'tr' ? 'SIĞINAK' : (language === 'ar' ? 'المأوى' : 'SHELTER');
    if (language === 'tr' && !name.toLowerCase().includes('sığınak')) {
      return `${name} Sığınağı`;
    }
    return name;
  }, [rawNameFromAllSources, language]);

  const shelterTheme = React.useMemo(() => {
    return {
      header: colors.primary,
      mapBg: isDark ? '#1E293B' : '#FFFFFF',
      bg: colors.background,
      accent: colors.primary
    };
  }, [shelterName, isDark, colors]);

  const shelterLayout = React.useMemo(() => {
    const name = shelterName.toLowerCase();

    const layoutScreenshot = [
      'SLP_A_1', 'WC2_1', 'ENTRY_2', 'PET_1', 'SEC',
      'PRY', 'INFO', 'MKT', 'OUT',
      'EXIT', 'MED', 'WC1_1', 'KIDS',
      'SLP_B_1', 'HED', 'PSY', 'SLP_S1',
      'H1', 'SLP_B_2', 'ENTRY', 'WC2_2', 'SLP_B_3'
    ];

    const layoutPrevKC = [
      'SLP_A_2', 'PET_1', 'ENTRY_2', 'H1', 'SLP_A_1',
      'OUT', 'WC2_1', 'SEC', 'EXIT',
      'INFO', 'KIDS', 'MED', 'SLP_B_1',
      'MKT', 'WC1_1', 'PRY', 'HED',
      'PSY', 'SLP_S1', 'ENTRY', 'WC2_2', 'SLP_B_2'
    ];

    const layoutBüyükçekmece = [
      'MED', 'KIDS', 'ENTRY_2', 'H1', 'SLP_A_1',
      'OUT', 'SLP_A_2', 'SEC', 'SLP_S1',
      'SLP_B_1', 'WC2_1', 'MED_1', 'MKT',
      'WC1_1', 'PRY', 'PET_1', 'INFO',
      'PSY', 'ENTRY', 'WC2_2', 'SLP_B_2', 'EXIT'
    ];

    const layoutEsenyurt = [
      'PET_1', 'KIDS', 'ENTRY_2', 'MED', 'SLP_A_1',
      'OUT', 'WC2_1', 'SEC', 'EXIT',
      'INFO', 'PSY', 'SLP_B_1', 'SLP_B_2',
      'MKT', 'WC1_1', 'PRY', 'HED',
      'SLP_A_2', 'SLP_S1', 'ENTRY', 'WC2_2'
    ];

    if (name.includes('küçükçekmece')) return layoutScreenshot;
    if (name.includes('sultançiftliği')) return layoutPrevKC;
    if (name.includes('büyükçekmece')) return layoutBüyükçekmece;
    if (name.includes('esenyurt')) return layoutEsenyurt;

    return layoutScreenshot;
  }, [shelterName]);

  const [navigatingTo, setNavigatingTo] = React.useState<any>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [lastPos, setLastPos] = React.useState({ top: '92%', left: '50%' });
  const [currentLocName, setCurrentLocName] = React.useState('ANA GİRİŞ');
  const [loading, setLoading] = React.useState(false);
  const [showStartModal, setShowStartModal] = React.useState(true);
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);

  const getStablePosition = (index: number) => {
    const row = index < 5 ? 0 : index < 9 ? 1 : index < 13 ? 2 : index < 17 ? 3 : 4;
    const colIdx = index < 5 ? index : index < 9 ? (index - 5) : index < 13 ? (index - 9) : index < 17 ? (index - 13) : (index - 17);

    const rows = [0, 20, 40, 60, 84];
    const colConfigs = [[0, 25, 40, 60, 85], [0, 30, 52, 80], [0, 18, 52, 70], [0, 28, 52, 77], [0, 25, 40, 60, 85]];
    const widths = [[25, 15, 20, 25, 15], [30, 18, 28, 20], [18, 30, 18, 30], [28, 20, 25, 23], [25, 15, 20, 25, 15]];

    const topPos = rows[row];
    const leftPos = colConfigs[row][colIdx];
    const itemWidth = widths[row][colIdx];
    const itemHeight = 16;

    return {
      style: { position: 'absolute', top: topPos + '%', left: leftPos + '%', width: itemWidth + '%', height: itemHeight + '%' } as any,
      center: { top: (topPos + itemHeight / 2) + '%', left: (leftPos + itemWidth / 2) + '%' }
    };
  };

  const getNumeric = (val: string) => Number(val.replace('%', ''));

  const translations = {
    tr: { title: 'Sığınak Planı', arrived: 'Vardım', cancel: 'İptal', next: 'İleri Adım' },
    en: { title: 'Shelter Plan', arrived: 'Arrived', cancel: 'Cancel', next: 'Next Step' },
    ar: { title: 'خطة المأوى', arrived: 'وصلت', cancel: 'إلغاء', next: 'الخطوة التالية' }
  };
  const t = translations[language] || translations.tr;

  const facilities = React.useMemo(() => {
    const name = shelterName.toLowerCase();
    const getPos = (id: string, fallbackTop: string, fallbackLeft: string): { top: string, left: string } => {
      const idx = shelterLayout.findIndex((k: string) => k.startsWith(id));
      if (idx !== -1) return getStablePosition(idx).center;
      return { top: fallbackTop, left: fallbackLeft };
    };

    const base: Record<string, any> = {
      SLP_A: { id: 'SLP_A', name: 'A BLOK', icon: Bed, color: colors.primary, mapPos: getPos('SLP_A_1', '8%', '20%') },
      PET: { id: 'PET', name: 'PET ALANI', icon: Cat, color: '#F59E0B', mapPos: getPos('PET_1', '8%', '44%') },
      KIDS: { id: 'KIDS', name: 'ÇOCUK ALANI', icon: Baby, color: '#F472B6', mapPos: getPos('KIDS', '48%', '20%') },
      PSY: { id: 'PSY', name: 'PSİKOLOJİK', icon: Smile, color: '#0EA5E9', mapPos: getPos('PSY', '92%', '44%') },
      MED: { id: 'MED', name: 'MEDİKAL', icon: Stethoscope, color: '#EF4444', mapPos: getPos('MED', '48%', '56%') },
      MKT: { id: 'MKT', name: 'MARKET', icon: ShoppingBag, color: '#6366F1', mapPos: getPos('MKT', '68%', '84%') },
      SLP_B: { id: 'SLP_B', name: 'B BLOK', icon: Bed, color: colors.primary, mapPos: getPos('SLP_B_1', '48%', '20%') },
      PRY: { id: 'PRY', name: 'İBADETHANE', icon: Church, color: '#0D9488', mapPos: getPos('PRY', '68%', '44%') },
      H1: { id: 'H1', name: 'H-1 ÖZEL', icon: HeartPulse, color: '#8B5CF6', mapPos: getPos('H1', '8%', '73%') },
      WC1: { id: 'WC1', name: 'WC-01', icon: Users, color: '#A855F7', mapPos: getPos('WC1_1', '68%', '73%') },
      WC2: { id: 'WC2', name: 'WC-02', icon: Users, color: '#A855F7', mapPos: getPos('WC2_1', '28%', '84%') },
      HED: { id: 'HED', name: 'DEPO', icon: Package, color: '#475569', mapPos: getPos('HED', '68%', '60%') },
      INFO: { id: 'INFO', name: 'DANIŞMA', icon: Info, color: '#0EA5E9', mapPos: getPos('INFO', '48%', '38%') },
      SEC: { id: 'SEC', name: 'GÜVENLİK', icon: AlertCircle, color: '#B91C1C', mapPos: getPos('SEC', '28%', '70%') },
      EXIT: { id: 'EXIT', name: 'ACİL ÇIKIŞ', icon: DoorOpen, color: '#EA580C', mapPos: getPos('EXIT', '28%', '85%') },
      OUT: { id: 'OUT', name: 'ÇIKIŞ', icon: DoorOpen, color: '#475569', mapPos: getPos('OUT', '28%', '85%') },
      SLP_S1: { id: 'SLP_S1', name: 'S-1 BLOK', icon: Bed, color: colors.primary, mapPos: getPos('SLP_S1', '92%', '70%') },

      ENTRY: { id: 'ENTRY', name: 'GİRİŞ', icon: DoorOpen, color: '#64748B', mapPos: getPos('ENTRY', '92%', '17%') },
      ENTRY_2: { id: 'ENTRY_2', name: 'KUZEY GİRİŞİ', icon: DoorOpen, color: '#64748B', mapPos: getPos('ENTRY_2', '8%', '17%') }
    };

    return base;
  }, [shelterName, language, currentLocName, shelterLayout]);

  const selectStartEntry = (type: 'ALT' | 'UST') => {
    const entryId = type === 'ALT' ? 'ENTRY' : 'ENTRY_2';
    const idx = shelterLayout.indexOf(type === 'ALT' ? 'ENTRY' : 'ENTRY_2');
    const pos = idx !== -1 ? getStablePosition(idx).center : (type === 'ALT' ? { top: '92%', left: '50%' } : { top: '8%', left: '50%' });
    setLastPos(pos);
    setCurrentLocName(type === 'ALT' ? 'ANA GİRİŞ' : 'KUZEY GİRİŞİ');
    setSelectedEntryId(entryId);
    setShowStartModal(false);
  };

  const mapContainerBg = isDark ? '#0F172A' : '#F1F5F9';

  const getFacilityDisplay = (id: string) => {
    const baseKey = id.includes('SLP_A') ? 'SLP_A' : id.includes('SLP_B') ? 'SLP_B' : id.includes('SLP_S1') ? 'SLP_S1' : id.split('_')[0];
    const itemRaw = (facilities as any)[baseKey];
    if (!itemRaw) return null;

    let fn = itemRaw.name, fi = itemRaw.icon, fc = itemRaw.color;
    if (baseKey.startsWith('WC')) { fc = '#A855F7'; if (id === 'WC1_1') fn = 'WC 1'; else if (id === 'WC2_1') fn = 'WC 2'; else if (id === 'WC2_2') { fn = 'B BLOK'; fi = Bed; fc = colors.primary; } }
    else if (baseKey.startsWith('SLP')) { if (id === 'SLP_A_1') fn = 'A BLOK'; else if (id === 'SLP_A_2') { fn = 'DEPO'; fi = Package; fc = '#475569'; } else if (id === 'SLP_B_1') fn = 'C BLOK'; else if (id === 'SLP_B_2') { fn = 'ECZANE'; fi = Stethoscope; fc = '#EF4444'; } else if (id === 'SLP_B_3' || id === 'SLP_B_2_ALT') { fn = 'MARKET 2'; fi = ShoppingBag; fc = '#6366F1'; } else if (id === 'SLP_S1') { fn = 'D BLOK'; fc = colors.primary; } }

    else if (baseKey === 'MKT') { fn = 'MARKET'; fi = ShoppingBag; }
    else if (baseKey === 'MED') { fn = 'ECZANE'; fi = Stethoscope; fc = '#EF4444'; }
    else if (baseKey === 'ENTRY') { fn = id === 'ENTRY' ? 'ANA GİRİŞ' : 'KUZEY GİRİŞİ'; fi = DoorOpen; fc = '#10B981'; }

    // Pin should be exactly on THIS box
    const idx = shelterLayout.indexOf(id);
    const mPos = idx !== -1 ? getStablePosition(idx).center : itemRaw.mapPos;

    const startTop = Number(lastPos.top.replace('%', ''));
    const endTop = Number(mPos.top.replace('%', ''));
    const dir = startTop > endTop ? 'KUZEY' : 'GÜNEY';
    const mainAction = Math.abs(startTop - endTop) > 5 ? `ANA YOLDAN ${dir} YÖNÜNE İLERLEYİN` : 'KORİDORA YÖNELİN';

    let corridor = 'ANA KORİDOR';
    if (endTop < 20) corridor = 'KORİDOR A HATTI';
    else if (endTop < 40) corridor = 'KORİDOR B HATTI';
    else if (endTop < 60) corridor = 'KORİDOR C HATTI';
    else corridor = 'KORİDOR D HATTI';

    const targetX = Number(mPos.left.replace('%', ''));
    let turnDir = targetX > 50 ? 'SAĞ' : 'SOL';

    // Invert turn direction if facing SOUTH
    if (dir === 'GÜNEY') {
      turnDir = targetX > 50 ? 'SOL' : 'SAĞ';
    }

    const finalSteps = [
      `KONUM: ${currentLocName}`,
      `ANA YOLDAN ${dir} YÖNÜNE İLERLEYİN`,
      `${corridor}'NA ULAŞIN VE ${turnDir} TARAFINIZA DÖNÜN`
    ];

    return { ...itemRaw, name: fn, icon: fi, color: fc, id, mapPos: mPos, steps: finalSteps };
  };

  const getPathPoints = (start: any, end: any) => [
    start,
    { top: end.top, left: '50%' }, // Pivot point in center corridor
    end
  ];

  const pathPoints = React.useMemo(() => navigatingTo ? getPathPoints(lastPos, navigatingTo.mapPos) : [], [navigatingTo, lastPos]);
  const userPos = (navigatingTo && pathPoints.length > 0) ? pathPoints[Math.min(currentStep, pathPoints.length - 1)] : lastPos;
  const startNav = (fac: any) => { setLoading(true); setTimeout(() => { setNavigatingTo(fac); setCurrentStep(0); setLoading(false); }, 600); };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: shelterTheme.bg }]}>
      <StatusBar barStyle="light-content" />

      {showStartModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.startModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <MapPin size={32} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>NEREDESİNİZ?</Text>
              <Text style={[styles.modalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>Navigasyonun başlaması için lütfen bulunduğunuz girişi seçin.</Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: isDark ? '#065F46' : '#10B981' }]}
                onPress={() => selectStartEntry('ALT')}
              >
                <ArrowDown size={24} color="#FFF" />
                <View>
                  <Text style={styles.startBtnTitle}>ANA GİRİŞ</Text>
                  <Text style={styles.startBtnSub}>Güney / Alt Giriş Hattı</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: isDark ? '#1E3A8A' : colors.primary }]}

                onPress={() => selectStartEntry('UST')}
              >
                <ArrowUp size={24} color="#FFF" />
                <View>
                  <Text style={styles.startBtnTitle}>KUZEY GİRİŞİ</Text>
                  <Text style={styles.startBtnSub}>Üst Hattı / Arka Giriş</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Premium Header */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />

        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!navigatingTo}
      >
        <View style={[styles.mapGraphic, styles.shadow, { backgroundColor: shelterTheme.mapBg }]}>
          <View style={styles.floorLabelWrapper}>
            <ShieldCheck size={24} color={shelterTheme.accent} />
            <Text style={[styles.floorLabel, { color: isDark ? '#FFF' : '#1E3A8A' }]}>{shelterName}</Text>
          </View>
          <View style={[styles.mapContainer, { borderWidth: 3.5, borderColor: isDark ? '#334155' : '#000', backgroundColor: mapContainerBg }]}>
            <View style={{ position: 'absolute', top: '17%', height: '65%', left: '48%', width: '4%', backgroundColor: isDark ? '#334155' : '#D1D5DB', zIndex: 1 }} />
            <View style={{ position: 'absolute', top: -14, left: '49%', zIndex: 10 }}><Text style={{ color: isDark ? '#94A3B8' : '#000', fontWeight: '900', fontSize: 10 }}>K</Text></View>
            <View style={{ position: 'absolute', bottom: -14, left: '49%', zIndex: 10 }}><Text style={{ color: isDark ? '#94A3B8' : '#000', fontWeight: '900', fontSize: 10 }}>G</Text></View>
            <View style={[styles.tacticalPath, { top: '17%', left: 0, right: 0, height: 16, backgroundColor: isDark ? '#334155' : '#D1D5DB', justifyContent: 'flex-start', alignItems: 'center', zIndex: 5, paddingLeft: 10 }]}><Text style={[styles.pathLabel, { color: colors.primary, fontSize: 10, fontWeight: '900' }]}>KORİDOR A HATTI</Text></View>
            <View style={[styles.tacticalPath, { top: '38%', left: 0, right: 0, height: 16, backgroundColor: isDark ? '#334155' : '#D1D5DB', justifyContent: 'flex-start', alignItems: 'center', zIndex: 5, paddingLeft: 10 }]}><Text style={[styles.pathLabel, { color: colors.primary, fontSize: 10, fontWeight: '900' }]}>KORİDOR B HATTI</Text></View>
            <View style={[styles.tacticalPath, { top: '57%', left: 0, right: 0, height: 16, backgroundColor: isDark ? '#334155' : '#D1D5DB', justifyContent: 'flex-end', alignItems: 'center', zIndex: 5, paddingRight: 10 }]}><Text style={[styles.pathLabel, { color: colors.primary, fontSize: 10, fontWeight: '900' }]}>KORİDOR C HATTI</Text></View>
            <View style={[styles.tacticalPath, { top: '78%', left: 0, right: 0, height: 16, backgroundColor: isDark ? '#334155' : '#D1D5DB', justifyContent: 'flex-end', alignItems: 'center', zIndex: 5, paddingRight: 10 }]}><Text style={[styles.pathLabel, { color: colors.primary, fontSize: 10, fontWeight: '900' }]}>KORİDOR D HATTI</Text></View>



            <View style={[styles.userDot, { top: userPos.top as any, left: userPos.left as any }]}>
              <MapPin size={22} color={colors.primary} fill={isDark ? "rgba(147, 197, 253, 0.2)" : "rgba(59, 130, 246, 0.3)"} /><Text style={styles.userText}>SİZ</Text>
            </View>


            {shelterLayout.map((itemKey: string, index: number) => {
              const p = getStablePosition(index);
              if (!p) return null;

              if (itemKey.startsWith('EMPTY')) return <View key={itemKey} style={p.style} />;

              const baseKey = itemKey.includes('SLP_A') ? 'SLP_A' :
                itemKey.includes('SLP_B') ? 'SLP_B' :
                  itemKey.includes('SLP_S1') ? 'SLP_S1' :
                    itemKey.split('_')[0];

              const isEntryExit = baseKey === 'ENTRY' || baseKey === 'EXIT' || baseKey === 'OUT';
              if (isEntryExit) {
                const l = String(p.style.left || '');
                const t = String(p.style.top || '');
                let side: any = 'top';
                if (index < 5) side = 'top';
                else if (index >= 17) side = 'bottom';
                else if (index === 5 || index === 6 || index === 9 || index === 10 || index === 13 || index === 14) side = 'left';
                else side = 'right';

                const item = getFacilityDisplay(itemKey);
                const isEntry = baseKey.startsWith('ENTRY');
                const isExit = baseKey === 'EXIT' || baseKey === 'OUT';
                const accentColor = isEntry ? '#10B981' : (isExit ? '#EF4444' : '#000000');

                let label = '';
                if (isEntry) {
                  label = itemKey === 'ENTRY' ? (language === 'tr' ? 'ANA GİRİŞ' : 'MAIN ENTRY') : (language === 'tr' ? 'KUZEY GİRİŞ' : 'NORTH ENTRY');
                } else if (isExit) {
                  label = itemKey === 'OUT' ? (language === 'tr' ? 'ÇIKIŞ 1' : 'EXIT 1') : (language === 'tr' ? 'ÇIKIŞ 2' : 'EXIT 2');
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => startNav(item)}
                    style={[p.style, styles.accessPoint]}
                  >
                    <View style={[styles.accessDoor, {
                      [side]: -8,
                      backgroundColor: accentColor,
                      width: (side === 'top' || side === 'bottom') ? 12 : 4,
                      height: (side === 'left' || side === 'right') ? 12 : 4,
                    }]} />
                    {isEntry ? (
                      index < 11 ? <ArrowDown size={18} color={accentColor} /> : <ArrowUp size={18} color={accentColor} />
                    ) : (
                      (index === 0 || index === 5 || index === 9 || index === 13 || index === 17) ? (
                        <ArrowLeft size={18} color={accentColor} />
                      ) : (
                        <ArrowRight size={18} color={accentColor} />
                      )
                    )}
                    <Text style={[styles.accessText, { color: accentColor }]}>{label}</Text>
                  </TouchableOpacity>
                );
              }

              const item = getFacilityDisplay(itemKey);
              if (!item) return <View key={itemKey} style={p.style} />;

              let doorPos: any = 'bottom';
              let doorPos2: any = null;
              let doorPos3: any = null;

              if (baseKey === 'EXIT' || baseKey === 'OUT') {
                doorPos = index < 5 ? 'top' : 'bottom';
                doorPos2 = index < 5 ? 'bottom' : 'top';
                doorPos3 = (index === 7 || index === 8 || index === 11 || index === 12 || index === 15 || index === 16) ? 'left' : 'right';
              } else if (index < 5) {
                doorPos = 'bottom';
              } else if (index >= 17) {
                doorPos = 'top';
              } else {
                doorPos = 'top';
                doorPos2 = 'bottom';
                doorPos3 = null;
              }

              return <MapZone key={itemKey} item={item} active={navigatingTo?.id === itemKey} style={p.style} onPress={startNav} doorPos={doorPos} doorPos2={doorPos2} doorPos3={doorPos3} isDark={isDark} colors={colors} />;
            })}
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={[styles.currentLocationBadge, { backgroundColor: isDark ? colors.surface : colors.primary, borderColor: isDark ? colors.border : '#FFFFFF30' }]}>

            <MapPin size={16} color="#FFF" />
            <Text style={styles.currentLocationText}>ŞU AN: {currentLocName}</Text>
          </View>
        </View>

        {navigatingTo ? (
          <View style={styles.activeNavHud}>
            <View style={[styles.instructionBox, styles.shadow, { backgroundColor: colors.card }]}>
              <Text style={[styles.currentStepText, { color: colors.text }]}>
                {navigatingTo.steps[Math.min(currentStep, navigatingTo.steps.length - 1)]}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => setNavigatingTo(null)}
                >
                  <Text style={{ color: '#EF4444', fontWeight: '800' }}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => {
                  if (currentStep < pathPoints.length - 1) setCurrentStep(currentStep + 1);
                  else { setLastPos(navigatingTo.mapPos); setCurrentLocName(navigatingTo.name); setNavigatingTo(null); setCurrentStep(0); }
                }}><Text style={styles.navButtonText}>{currentStep < pathPoints.length - 1 ? t.next : t.arrived}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={{ marginTop: 10, marginBottom: 15 }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: isDark ? '#94A3B8' : '#1E3A8A', letterSpacing: 1 }}>SIĞINAK TESİSLERİ</Text>
              <View style={{ height: 2, backgroundColor: isDark ? colors.border : colors.primary, width: 40, marginTop: 4, borderRadius: 1 }} />

            </View>

            {(() => {
              const allItems = shelterLayout
                .map((id: string) => getFacilityDisplay(id))
                .filter((item: any) => item !== null) as any[];

              const uniqueItems = Array.from(new Map(allItems.map((item: any) => [item.id, item])).values());

              const exits = uniqueItems.filter((i: any) => i.name.includes('ÇIKIŞ'));
              const entries = uniqueItems.filter((i: any) => i.name.includes('GİRİŞ'));
              const blocks = uniqueItems.filter((i: any) => i.name.includes('BLOK'));
              const wcs = uniqueItems.filter((i: any) => i.name.includes('WC'));
              const health = uniqueItems.filter((i: any) => i.name === 'ECZANE');
              const others = uniqueItems.filter((i: any) =>
                !i.name.includes('BLOK') &&
                !i.name.includes('WC') &&
                i.name !== 'ECZANE' &&
                !i.name.includes('GİRİŞ') &&
                !i.name.includes('ÇIKIŞ')
              );

              return (
                <>
                  <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444', marginBottom: 8, letterSpacing: 1.5 }}>ÇIKIŞLAR</Text>
                      <View style={{ gap: 10 }}>{exits.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { width: '100%', backgroundColor: colors.card, borderColor: isDark ? '#7F1D1D' : '#FECACA' }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color="#EF4444" /><Text style={[styles.destinationLabel, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', marginBottom: 8, letterSpacing: 1.5 }}>GİRİŞLER</Text>
                      <View style={{ gap: 10 }}>{entries.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { width: '100%', backgroundColor: colors.card, borderColor: isDark ? '#064E3B' : '#D1FAE5' }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color="#10B981" /><Text style={[styles.destinationLabel, { color: isDark ? '#6EE7B7' : '#065F46' }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                  </View>

                  {blocks.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1.5 }}>BLOKLAR</Text>
                      <View style={styles.grid}>{blocks.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color={item.color} /><Text style={[styles.destinationLabel, { color: colors.text }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1.5 }}>TUVALETLER</Text>
                      <View style={{ gap: 10 }}>{wcs.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { width: '100%', backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color={item.color} /><Text style={[styles.destinationLabel, { color: colors.text }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1.5 }}>SAĞLIK</Text>
                      <View style={{ gap: 10 }}>{health.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { width: '100%', backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color={item.color} /><Text style={[styles.destinationLabel, { color: colors.text }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                  </View>

                  {others.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 8, letterSpacing: 1.5 }}>DİĞER TESİSLER</Text>
                      <View style={styles.grid}>{others.map((item: any, idx: number) => (
                        <TouchableOpacity key={item.id + idx} style={[styles.destinationItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startNav(item)}>
                          <item.icon size={18} color={item.color} /><Text style={[styles.destinationLabel, { color: colors.text }]}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}</View>
                    </View>
                  )}
                </>
              );
            })()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MapZone({ item, active, style, onPress, doorPos = 'bottom', doorPos2 = null, doorPos3 = null, isDark, colors }: any) {
  const getDoorStyle = (pos: string) => {
    switch (pos) {
      case 'top': return { top: 0, width: 10, height: 3 };
      case 'bottom': return { bottom: 0, width: 10, height: 3 };
      case 'left': return { left: 0, width: 3, height: 10 };
      case 'right': return { right: 0, width: 3, height: 10 };
      default: return { bottom: 0, width: 10, height: 3 };
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[
        styles.mapZone,
        style,
        {
          backgroundColor: active ? colors.primary : (isDark ? colors.background : '#F0F9FF'),
          borderColor: active ? (isDark ? colors.primary : '#1E3A8A') : (isDark ? colors.border : '#1E3A8A')
        },
        { borderWidth: active ? 2.5 : 1.5 }
      ]}
    >
      <View style={[styles.doorIndicator, getDoorStyle(doorPos) as any, { backgroundColor: active ? '#FFF' : (isDark ? colors.primary : '#1E3A8A') }]} />
      {doorPos2 && <View style={[styles.doorIndicator, getDoorStyle(doorPos2) as any, { backgroundColor: active ? '#FFF' : (isDark ? colors.primary : '#1E3A8A') }]} />}
      {doorPos3 && <View style={[styles.doorIndicator, getDoorStyle(doorPos3) as any, { backgroundColor: active ? '#FFF' : (isDark ? colors.primary : '#1E3A8A') }]} />}
      <Text style={[styles.zoneLabel, { color: active ? '#FFF' : (isDark ? colors.textSecondary : colors.primary) }]} numberOfLines={1}>{item.name}</Text>
      <item.icon size={12} color={active ? '#FFF' : (isDark ? colors.textSecondary : colors.primary)} />

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgHeader: { height: height * 0.22, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  scrollContent: { padding: 20 },
  mapGraphic: { borderRadius: 32, padding: 12, height: 480, marginBottom: 20 },
  floorLabelWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 },
  floorLabel: { fontSize: 16, fontWeight: '900', color: '#1E3A8A', textTransform: 'uppercase' },
  currentLocationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginTop: 4, gap: 8, borderWidth: 1.5, borderColor: '#FFFFFF30' },
  currentLocationText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  mapContainer: { flex: 1, backgroundColor: '#F1F5F9', position: 'relative', overflow: 'hidden', borderRadius: 16 },
  tacticalPath: { position: 'absolute', zIndex: -1 },
  pathLabel: { fontSize: 6, fontWeight: '900', color: '#64748B', letterSpacing: 1, textTransform: 'uppercase' },
  userDot: { position: 'absolute', zIndex: 100, alignItems: 'center' },
  userText: { fontSize: 7, fontWeight: '900', color: '#1D4ED8', backgroundColor: '#FFF', paddingHorizontal: 3, borderRadius: 4 },
  mapZone: { position: 'absolute', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', padding: 2 },
  accessPoint: { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 },
  accessDoor: { position: 'absolute', backgroundColor: '#1E3A8A', borderRadius: 2, zIndex: 50 },
  accessText: { fontSize: 7, fontWeight: '900', color: '#1E3A8A', marginTop: 2 },
  doorIndicator: { position: 'absolute', zIndex: 20, borderWidth: 1, borderColor: '#FFF' },
  zoneLabel: { fontSize: 6.5, fontWeight: '900', textAlign: 'center', letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  destinationItem: { width: '48%', backgroundColor: '#FFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  destinationLabel: { fontSize: 10, fontWeight: '800', color: '#334155' },
  activeNavHud: { alignItems: 'center', marginTop: 10 },
  instructionBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, width: '90%', alignItems: 'center' },
  currentStepText: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  navButton: { backgroundColor: '#3B82F6', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  navButtonText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 }
    })
  },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999, justifyContent: 'center', alignItems: 'center', padding: 25 },
  startModalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, width: '90%', maxWidth: 360, alignItems: 'center' },
  modalHeader: { alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1E3A8A', marginTop: 8 },
  modalSubtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 16 },
  modalButtonContainer: { width: '100%', gap: 10 },
  startBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  startBtnTitle: { color: '#FFF', fontSize: 17, fontWeight: '900' },
  startBtnSub: { color: '#FFFFFFE0', fontSize: 11, fontWeight: '500' },
});