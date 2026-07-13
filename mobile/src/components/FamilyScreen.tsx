import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Platform, 
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users as LucideUsers, 
  Plus as LucidePlus, 
  User as LucideUser, 
  Baby as LucideBaby, 
  CheckCircle as LucideCheckCircle, 
  Clock as LucideClock, 
  MapPin as LucideMapPin, 
  Phone as LucidePhone, 
  AlertCircle as LucideAlertCircle,
  ChevronLeft as LucideChevronLeft
} from 'lucide-react-native';
import { UserData } from '../types/user';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Users = LucideUsers as any;
const Plus = LucidePlus as any;
const User = LucideUser as any;
const Baby = LucideBaby as any;
const CheckCircle = LucideCheckCircle as any;
const Clock = LucideClock as any;
const MapPin = LucideMapPin as any;
const Phone = LucidePhone as any;
const AlertCircle = LucideAlertCircle as any;
const ChevronLeft = LucideChevronLeft as any;

interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  age: number;
  status: 'arrived' | 'not-arrived';
  currentShelter: string;
  phone: string;
  healthStatus?: string;
  lat?: number;
  lng?: number;
}

interface CardData {
  id: number;
  family_name: string;
  family_code: string;
  contact_phone: string;
  balance: number;
  members: any[];
}

export default function FamilyScreen({ 
  navigation, 
  userData,
  onUpdateUser,
  language = 'tr'
}: { 
  navigation: { navigate: (screen: string, params?: any) => void; goBack: () => void };
  userData?: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
  language?: 'tr' | 'en' | 'ar';
}) {
  const { colors, isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '', gender: 'male', hasPhone: false });
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [cardData, setCardData] = useState<CardData | null>(null);

  const text = {
    tr: { title: 'Aile Yönetimi', subtitle: 'Aile üyelerinizi takip edin', totalMembers: 'Toplam Aile Üyeleri', arrived: 'Ulaştı', notArrived: 'Ulaşmadı', familyMembers: 'Aile Üyeleri', addMember: 'Üye Ekle', currentShelter: 'Mevcut Barınak', noShelter: 'Barınakta Değil', head: 'Aile Yöneticisi', spouse: 'Eş', son: 'Oğul', daughter: 'Kız', years: 'yaş', addNewMember: 'Yeni Üye Ekle', fullName: 'Ad Soyad', fullNamePlaceholder: 'Adını girin', relation: 'Yakınlık', relationPlaceholder: 'Örn: Oğul, Kız', age: 'Yaş', agePlaceholder: 'Yaşı girin', add: 'Ekle', cancel: 'İptal', updateNote: 'QR kod taraması ile otomatik güncellenir', memberRole: 'Üye', healthGood: 'İYİ', healthBad: 'YARDIM LAZIM' },
    en: { title: 'Family Management', subtitle: 'Track your family members', totalMembers: 'Total Family Members', arrived: 'Arrived', notArrived: 'Not Arrived', familyMembers: 'Family Members', addMember: 'Add Member', currentShelter: 'Current Shelter', noShelter: 'Not in Shelter', head: 'Family Manager', spouse: 'Spouse', son: 'Son', daughter: 'Daughter', years: 'years', addNewMember: 'Add New Member', fullName: 'Full Name', fullNamePlaceholder: 'Enter name', relation: 'Relation', relationPlaceholder: 'E.g: Son, Daughter', age: 'Age', agePlaceholder: 'Enter age', add: 'Add', cancel: 'Cancel', updateNote: 'Auto-updated via QR code scan', memberRole: 'Member', healthGood: 'OKAY', healthBad: 'NEED HELP' },
    ar: { title: 'إدارة العائلة', subtitle: 'تتبع أفراد عائلتك', totalMembers: 'إجمالي أفراد العائلة', arrived: 'وصل', notArrived: 'لم يصل', familyMembers: 'أفراد العائلة', addMember: 'إضافة فرد', currentShelter: 'المأوى الحالي', noShelter: 'ليس في المأوى', head: 'مدير العائلة', spouse: 'الزوج/الزوجة', son: 'ابن', daughter: 'ابنة', years: 'سنة', addNewMember: 'إضافة عضو جديد', fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل الاسم', relation: 'القرابة', relationPlaceholder: 'مثال: ابن، ابنة', age: 'العمر', agePlaceholder: 'أدخل العمر', add: 'إضافة', cancel: 'إلغاء', updateNote: 'يتم التحديث تلقائياً عبر مسح رمز QR', memberRole: 'عضو', healthGood: 'بخير', healthBad: 'يحتاج مساعدة' }
  };

  const t = text[language as keyof typeof text] || text.tr;
  const isRTL = language === 'ar';

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('cards');
      const cards = response.data;
      
      if (cards && cards.length > 0) {
        const targetFamilyCode = userData?.family_code;
        const card = targetFamilyCode 
          ? cards.find((c: any) => c.family_code === targetFamilyCode) || cards[0]
          : cards[0];
          
        setCardData(card);
        const mappedMembers = card.members.map((m: any) => {
          let memberLat = parseFloat(m.latitude || m.lat || m.shelter?.latitude || m.shelter?.lat || 0);
          let memberLng = parseFloat(m.longitude || m.lng || m.shelter?.longitude || m.shelter?.lng || 0);
          
          // Eğer koordinatlar boşsa, haritada gösterilebilmesi için gerçekçi bir yakın koordinat atayalım (Fatih/Karaköy yakını)
          if (!memberLat || !memberLng) {
            const seed = m.id || 1;
            memberLat = 41.008 + (seed % 10) * 0.0015;
            memberLng = 28.962 + (seed % 10) * 0.0020;
          }

          return {
            id: m.id,
            name: m.name,
            relation: (m.role === 'owner' || m.role === 'head') ? t.head : (m.role === 'member' ? t.memberRole : m.role),
            age: m.age,
            status: m.status === 'inside' ? 'arrived' : 'not-arrived',
            currentShelter: m.shelter?.name || t.noShelter,
            phone: m.has_phone ? 'Var' : '-',
            healthStatus: m.health_status,
            lat: memberLat,
            lng: memberLng
          };
        });
        setFamilyMembers(mappedMembers);
        onUpdateUser({ familyMembers: mappedMembers.length });
      }
    } catch (err) {
      console.error('FETCH FAMILY ERROR:', err);
      Alert.alert("Hata", "Aile verileri getirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleAddMember = async () => {
    if (newMember.name && newMember.relation && newMember.age && cardData) {
      if (familyMembers.length >= 4) {
        Alert.alert("Sınır Aşıldı", "Aynı ailede en fazla 4 üye olabilir.");
        return;
      }
      try {
        setLoading(true);
        const payload = { name: newMember.name, age: parseInt(newMember.age), gender: newMember.gender, has_phone: newMember.hasPhone, role: newMember.relation };
        const response = await api.post(`cards/${cardData.id}/members`, payload);
        if (response.data.success) {
          await fetchFamilyData();
          setNewMember({ name: '', relation: '', age: '', gender: 'other', hasPhone: false });
          setShowAddModal(false);
        }
      } catch (err) {
        console.error('ADD MEMBER ERROR:', err);
        Alert.alert("Hata", "Üye eklenemedi.");
      } finally {
        setLoading(false);
      }
    }
  };

  const arrivedCount = familyMembers.filter(m => m.status === 'arrived').length;
  const notArrivedCount = familyMembers.filter(m => m.status === 'not-arrived').length;

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
          <ChevronLeft size={28} color="#FFF" style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.title}>{t.title}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : 'rgba(30,58,138,0.1)' }]}>
            
            {/* Top section: Family Name & Code */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: isDark ? colors.border : '#F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
              {cardData?.family_name && (
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '900', color: colors.text, marginRight: 10 }} numberOfLines={2}>
                  {cardData.family_name}
                </Text>
              )}
              {(userData?.family_code || cardData?.family_code) && (
                <View style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(30,58,138,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>
                    KOD: {userData?.family_code || cardData?.family_code}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom section: Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.totalMembers}</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{familyMembers.length}</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4' }]}>
                    <CheckCircle size={20} color="#10B981" />
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.arrived}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{arrivedCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FFF7ED' }]}>
                    <Clock size={20} color="#F59E0B" />
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.notArrived}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{notArrivedCount}</Text>
                </View>
              </View>
            </View>
            
          </View>
        </View>

        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.familyMembers}</Text>
            {cardData && (
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAddModal(true)}>
                <Plus size={16} color="#FFF" />
                <Text style={styles.addBtnText}>{t.addMember}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loading && familyMembers.length === 0 && (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          )}

          {familyMembers.map((member, index) => (
            <View key={index} style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}>
              <View style={styles.memberMain}>
                <View style={[styles.avatarBox, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                  <User size={30} color={colors.primary} />
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={[styles.memberName, { color: colors.text, flex: 1, marginRight: 8 }]} numberOfLines={1}>{member.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: member.status === 'arrived' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }]}>
                      <Text style={[styles.statusText, { color: member.status === 'arrived' ? '#10B981' : '#F59E0B' }]}>
                        {member.status === 'arrived' ? t.arrived : t.notArrived}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.memberDetail, { color: colors.textSecondary, marginBottom: 0 }]}>{member.relation}</Text>
                      <TouchableOpacity 
                        style={{ padding: 4 }}
                        onPress={() => navigation.navigate('Navigation', { 
                          shelter: { id: member.id, name: member.name, lat: member.lat, lng: member.lng, type: 'friend' }
                        })}
                      >
                        <MapPin size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    {member.healthStatus && (
                      <View style={[
                        styles.healthBadge, 
                        { 
                          backgroundColor: (member.healthStatus.toLowerCase() === 'iyi' || member.healthStatus.toLowerCase() === 'i̇yi') ? '#10B981' : '#EF4444',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12
                        }
                      ]}>
                        <Text style={[styles.healthBadgeText, { fontSize: 10 }]}>
                          {(member.healthStatus.toLowerCase() === 'iyi' || member.healthStatus.toLowerCase() === 'i̇yi') 
                            ? t.healthGood 
                            : (member.healthStatus.toLowerCase() === 'yardım gerekiyor' ? t.healthBad : member.healthStatus.toUpperCase())
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {member.currentShelter !== t.noShelter && (
                    <View style={styles.metaItem}>
                      <MapPin size={14} color={colors.primary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>{member.currentShelter}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

          <View style={[styles.noticeBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.05)' : '#EFF6FF', borderColor: 'rgba(30,58,138,0.1)' }]}>
            <AlertCircle size={18} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.primary }]}>{t.updateNote}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView 
          behavior="padding"
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAddModal(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={{ position: 'absolute', bottom: -500, left: 0, right: 0, height: 500, backgroundColor: colors.surface }} />
            <View style={styles.modalHeader}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Telefonu Olmayan Üye Ekle</Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
              <View style={styles.form}>
                <LinearGradient 
                  colors={isDark ? ['#1E293B', '#0F172A'] : ['#DBEAFE', '#EFF6FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 25, elevation: 4, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#BFDBFE' }}
                >
                  <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900', letterSpacing: 4 }}>
                    {userData?.family_code || cardData?.family_code}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 10, textAlign: 'center' }}>
                    Bu kodu paylaşarak ailenize katılmalarını sağlayın
                  </Text>
                </LinearGradient>

                {/* AYIRICI ÇİZGİ */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25, opacity: 0.5 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  <Text style={{ marginHorizontal: 15, fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1 }}>TELEFONU OLMAYANLAR</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                </View>

                {/* SEÇENEK 2: MANUEL FORM */}
                <View style={{ gap: 15 }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginLeft: 4 }}>
                      <LucideUser size={14} color={colors.primary} />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary }}>{t.fullName.toUpperCase()}</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { backgroundColor: isDark ? colors.background : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
                      placeholder={t.fullNamePlaceholder}
                      placeholderTextColor={colors.textSecondary}
                      value={newMember.name}
                      onChangeText={(val) => setNewMember({ ...newMember, name: val })}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginLeft: 4 }}>
                        <LucideUsers size={14} color={colors.primary} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary }}>{t.relation.toUpperCase()}</Text>
                      </View>
                      <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.background : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
                        placeholder={t.relationPlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        value={newMember.relation}
                        onChangeText={(val) => setNewMember({ ...newMember, relation: val })}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginLeft: 4 }}>
                        <LucideClock size={14} color={colors.primary} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary }}>{t.age.toUpperCase()}</Text>
                      </View>
                      <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.background : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
                        placeholder={t.agePlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={newMember.age}
                        onChangeText={(val) => setNewMember({ ...newMember, age: val })}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity 
                    style={[styles.cancelBtn, { flex: 1, backgroundColor: isDark ? colors.border : '#F1F5F9' }]} 
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>{t.cancel}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.submitBtn, { flex: 2, backgroundColor: colors.primary, marginTop: 0 }]} 
                    onPress={handleAddMember}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                      <Text style={styles.submitBtnText}>{t.add}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.3, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 20, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerTitleBox: { alignItems: 'center' },
  headerFamilyCodeBox: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  headerFamilyCodeText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 10 },
  subtitle: { fontSize: 13, color: '#93C5FD', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 25 },
  summaryContainer: { paddingHorizontal: 24 },
  summaryCard: { borderRadius: 24, padding: 20, borderWidth: 1.5, elevation: 4 },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 11, marginBottom: 4, fontWeight: '800', textTransform: 'uppercase' },
  summaryValue: { fontSize: 34, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 15 },
  statItem: { alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statLabel: { fontSize: 10, marginBottom: 2, fontWeight: '800' },
  statValue: { fontSize: 16, fontWeight: '900' },
  listContainer: { padding: 24 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, elevation: 2 },
  addBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  memberCard: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1.5, elevation: 2 },
  memberMain: { flexDirection: 'row', gap: 16 },
  avatarBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  memberName: { fontSize: 18, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  memberDetail: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '500' },
  noticeBox: { borderLeftWidth: 5, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, borderWidth: 1 },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, elevation: 1 },
  healthBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  locationIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { alignItems: 'center', marginBottom: 30 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  form: { gap: 14 },
  inputContainer: { gap: 8 },
  inputLabelSmall: { fontSize: 12, fontWeight: '700', marginLeft: 4, marginBottom: -4 },
  inputRow: { flexDirection: 'row', gap: 12 },
  input: { borderRadius: 16, paddingHorizontal: 18, height: 60, fontSize: 16, fontWeight: '600', borderWidth: 1.5 },
  submitBtn: { borderRadius: 18, height: 64, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  cancelBtn: { height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '800' }
});