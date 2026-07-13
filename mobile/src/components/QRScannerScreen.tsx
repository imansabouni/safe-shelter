import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  AlertCircle as LucideAlertCircle,
  CheckCircle as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft,
  Info as LucideInfo,
  Lock as LucideLock,
  ScanLine as LucideScanLine,
  Users as LucideUsers
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ChevronLeft = LucideChevronLeft as any;
const CheckCircle = LucideCheckCircle as any;
const AlertCircle = LucideAlertCircle as any;
const ScanLine = LucideScanLine as any;
const Users = LucideUsers as any;

export default function QRScannerScreen({ navigation }: any) {
  const { userData, setUserData, language } = useApp();
  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [scanMode, setScanMode] = useState<'enter' | 'exit'>(userData?.status === 'inside-shelter' ? 'exit' : 'enter');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [successMode, setSuccessMode] = useState<'enter' | 'exit'>('enter');
  const [errorMessage, setErrorMessage] = useState('');
  const [companionModalVisible, setCompanionModalVisible] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [hasShownModal, setHasShownModal] = useState(false);

  const translations: any = {
    tr: { title: 'Güvenli Geçiş', subtitle: 'Giriş/Çıkış için QR Okutun', info: 'QR kodu çerçeve içine yerleştirin.', enter: 'GİRİŞ', exit: 'ÇIKIŞ', companionTitle: 'Yanında Kimler Var?', companionSub: 'Telefonu olmayan aile üyelerini seçin', finish: 'İŞLEMİ TAMAMLA' },
    en: { title: 'Secure Pass', subtitle: 'Scan QR for Entry/Exit', info: 'Place QR inside the frame.', enter: 'ENTRY', exit: 'EXIT', companionTitle: 'Who is with you?', companionSub: 'Select family members without phones', finish: 'FINISH PROCESS' }
  };
  const t = translations[language || 'tr'] || translations.tr;

  React.useEffect(() => {
    if (isFocused) {
      setScanMode(userData?.status === 'inside-shelter' ? 'exit' : 'enter');
    }
  }, [isFocused, userData?.status]);

  React.useEffect(() => {
    if (userData?.card_id && isFocused) {
      if (!hasShownModal) {
        // Sayfaya her girişte seçimleri ve tarama durumunu sıfırla
        setSelectedIds([]);
        setScanned(false);
        setErrorMessage('');
        
        api.get(`cards/${userData.card_id}`).then(res => {
          if (res.data.success) {
            // Sadece telefonu olmayan ve kendisi dışındaki üyeleri al
            const members = res.data.card.members.filter((m: any) => m.id !== userData.id && !m.has_phone);
            setFamilyMembers(members);
            
            // Sadece seçili işleme (giriş/çıkış) uygun üyeler varsa modali aç
            const initialMode = userData?.status === 'inside-shelter' ? 'exit' : 'enter';
            const relevant = members.filter((m: any) => initialMode === 'enter' ? m.status !== 'inside' : m.status === 'inside');
            if (relevant.length > 0) {
              setCompanionModalVisible(true);
            }
            setHasShownModal(true); // Gösterildi olarak işaretle
          }
        }).catch(() => {});
      }
    } else if (!isFocused) {
      // Sayfadan çıkınca kontrolü sıfırla
      setHasShownModal(false);
    }
  }, [userData, isFocused, hasShownModal]);

  React.useEffect(() => {
    if (familyMembers.length > 0 && hasShownModal) {
      setSelectedIds([]);
      const relevant = familyMembers.filter(m => scanMode === 'enter' ? m.status !== 'inside' : m.status === 'inside');
      if (relevant.length > 0) {
        setCompanionModalVisible(true);
      } else {
        setCompanionModalVisible(false);
      }
    }
  }, [scanMode, familyMembers, hasShownModal]);

  const handleBarCodeScanned = ({ data }: any) => {
    if (scanned || loading || !isFocused || companionModalVisible || modalVisible || !hasShownModal) return;
    setScanned(true);
    setLastScannedData(data);
    submitScan(data, selectedIds);
  };

  const submitScan = async (qrData: string, companionIds: number[]) => {
    setLoading(true);
    setCompanionModalVisible(false);
    setErrorMessage('');
    try {
      await api.post(`shelter/${scanMode}`, { 
        qr_code: qrData, 
        card_member_id: userData?.id,
        companion_ids: companionIds
      });
      setSuccessMode(scanMode);
      setModalType('success');
      setModalVisible(true);
      if (setUserData && userData) {
        setUserData({ ...userData, status: scanMode === 'enter' ? 'inside-shelter' : 'outside-shelter' });
      }
      setTimeout(() => { 
        setModalVisible(false); 
        navigation.goBack(); 
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setErrorMessage(msg);
      setModalType('error');
      setModalVisible(true);
    } finally { 
      setLoading(false); 
    }
  };

  const toggleCompanion = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <LucideLock size={64} color={colors.primary} />
        <Text style={[styles.permText, { color: colors.text }]}>Kamera izni gerekiyor.</Text>
        <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permBtnText}>İZİN VER</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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

        <View style={styles.modeToggle}>
          <TouchableOpacity style={[styles.modeBtn, scanMode === 'enter' && styles.modeBtnActive]} onPress={() => setScanMode('enter')}>
            <Text style={[styles.modeBtnText, scanMode === 'enter' && [styles.modeBtnTextActive, { color: colors.primary }]]}>{t.enter}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, scanMode === 'exit' && styles.modeBtnActive]} onPress={() => setScanMode('exit')}>
            <Text style={[styles.modeBtnText, scanMode === 'exit' && [styles.modeBtnTextActive, { color: colors.primary }]]}>{t.exit}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={[styles.scannerFrame, { borderColor: colors.primary }]}>
          {isFocused && (
            <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} />
          )}
          <View style={styles.viewfinder}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            <ScanLine size={40} color="rgba(255,255,255,0.2)" />
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF', borderColor: colors.primary }]}>
          <LucideInfo size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>{t.info}</Text>
        </View>
      </View>

      {/* Companion Selection Modal */}
      <Modal visible={companionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, maxHeight: height * 0.8 }]}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 20 }} />
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 5 }]}>{t.companionTitle}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 25, textAlign: 'center' }}>{t.companionSub}</Text>
            
            <View style={{ width: '100%', gap: 10, marginBottom: 25 }}>
              {familyMembers.filter(m => scanMode === 'enter' ? m.status !== 'inside' : m.status === 'inside').map((member) => (
                <TouchableOpacity 
                  key={member.id}
                  style={[
                    styles.companionItem, 
                    { backgroundColor: isDark ? colors.background : '#F8FAFC', borderColor: selectedIds.includes(member.id) ? colors.primary : colors.border }
                  ]}
                  onPress={() => toggleCompanion(member.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.companionIcon, { backgroundColor: selectedIds.includes(member.id) ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0') }]}>
                      <LucideUsers size={20} color={selectedIds.includes(member.id) ? '#FFF' : colors.textSecondary} />
                    </View>
                    <View>
                      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{member.name}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{member.role} • {member.age} Yaş</Text>
                    </View>
                  </View>
                  <View style={[styles.checkbox, { borderColor: selectedIds.includes(member.id) ? colors.primary : colors.border, backgroundColor: selectedIds.includes(member.id) ? colors.primary : 'transparent' }]}>
                    {selectedIds.includes(member.id) && <LucideCheckCircle size={18} color="#FFF" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: colors.primary, width: '100%' }]} 
              onPress={() => setCompanionModalVisible(false)}
            >
              <Text style={styles.submitBtnText}>SEÇİMİ TAMAMLA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ marginTop: 20 }} 
              onPress={() => { setSelectedIds([]); setCompanionModalVisible(false); }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>YALNIZIM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIcon, { backgroundColor: modalType === 'success' ? '#10B981' : '#EF4444' }]}>
              {modalType === 'success' ? <CheckCircle size={40} color="#FFF" /> : <AlertCircle size={40} color="#FFF" />}
            </View>
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>
              {modalType === 'success' 
                ? (successMode === 'enter' ? 'GİRİŞ BAŞARILI' : 'ÇIKIŞ BAŞARILI') 
                : 'İŞLEM BAŞARISIZ'}
            </Text>
            
            {modalType === 'error' && (
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', fontWeight: '600' }}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {modalType === 'error' && (
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => { setModalVisible(false); setScanned(false); }}>
                <Text style={styles.retryBtnText}>TEKRAR DENE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.35, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 85 : 95, marginBottom: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  modeToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginTop: 30 },
  modeBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  modeBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  modeBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  modeBtnTextActive: { color: '#1E3A8A' },
  main: { flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 50 },
  subtitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 30, textTransform: 'uppercase' },
  scannerFrame: { width: width * 0.75, height: width * 0.75, borderRadius: 40, overflow: 'hidden', borderWidth: 2, backgroundColor: '#000', elevation: 20 },
  viewfinder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cornerTL: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderTopWidth: 5, borderLeftWidth: 5, borderColor: '#FFF', borderTopLeftRadius: 15 },
  cornerTR: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTopWidth: 5, borderRightWidth: 5, borderColor: '#FFF', borderTopRightRadius: 15 },
  cornerBL: { position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: '#FFF', borderBottomLeftRadius: 15 },
  cornerBR: { position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottomWidth: 5, borderRightWidth: 5, borderColor: '#FFF', borderBottomRightRadius: 15 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.8)', justifyContent: 'center', alignItems: 'center' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40, padding: 18, borderRadius: 20, borderWidth: 1.5 },
  infoText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: { width: '100%', borderRadius: 36, padding: 32, alignItems: 'center' },
  modalIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25 },
  retryBtn: { height: 60, width: '100%', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  permText: { fontSize: 16, fontWeight: '600', marginVertical: 20 },
  permBtn: { paddingHorizontal: 40, paddingVertical: 18, borderRadius: 18 },
  permBtnText: { color: '#FFF', fontWeight: '900' },
  companionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1.5, width: '100%' },
  companionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' }
});
