import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StatusBar, 
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Heart, 
  DollarSign, 
  Package, 
  Send,
  MessageCircle,
  CheckCircle,
  CreditCard,
  MapPin,
  Truck,
  EyeOff,
  ChevronDown,
  Copy,
  Globe,
  Wifi,
  Activity,
  Zap
} from 'lucide-react-native';
import api from '../api/api';
import { UserData } from '../types/user';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface DonationScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void; goBack: () => void; };
  language?: 'tr' | 'en' | 'ar';
  userData?: UserData;
}

export default function DonationScreen({ navigation, language = 'tr', userData }: DonationScreenProps) {
  const { colors, isDark } = useTheme();
  const [type, setType] = useState<'money' | 'resource'>('money');
  const [amount, setAmount] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Adet');
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'drop_off' | 'pickup'>('drop_off');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQtyModalVisible, setIsQtyModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  
  const quantityOptions = ['1', '2', '5', '10', '25', '50', '100', '250', '500+'];
  const unitOptions = ['Adet', 'Kg', 'Litre', 'Paket', 'Koli', 'Çuval'];

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success';
    buttons: Array<{ text: string, onPress?: () => void, style?: 'cancel' | 'default' }>;
    onClose?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (title: string, message: string, buttons?: any[], type: 'info'|'error'|'success' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons: buttons || [{ text: 'Tamam' }],
      onClose: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  };

  const translations = {
    tr: { title: 'Bağış Yap', subtitle: 'Destekleriniz bizim için değerli ❤️', moneyTab: 'Nakit Bağışı', resourceTab: 'Eşya Bağışı', ibanLabel: 'IBAN BİLGİSİ', accountName: 'Safe Shelter', cashBtn: 'Nakit Bağış Merkezi', resourceLabel: 'Eşya / Kaynak Türü', quantityLabel: 'Adet / Miktar', deliveryLabel: 'Teslimat Tercihi', dropOffLabel: 'Merkeze Teslim', pickupLabel: 'Evden Alım', submit: 'Bağışı Tamamla', successTitle: 'Bağış Başarılı ❤️', successMessage: 'Desteğiniz ilgili yerlere ulaştırılacaktır. Teşekkürler!', goHome: 'Ana Sayfaya Dön', placeholderResource: 'Örn: Battaniye vb.', validationError: 'Lütfen gerekli alanları doldurun.', error: 'Bir hata oluştu, lütfen tekrar deneyin.', notice: 'IBAN üzerinden anında bağış yapabilir veya merkezimizi ziyaret ederek yardımların nasıl ulaştığını görebilirsiniz.', resourceNotice: 'Eşya bağışlarınız için kayıt oluşturabilir; alım koordinasyonu için ekiplerimizle iletişime geçebilirsiniz.', unitLabel: 'Birim', selectUnit: 'Birim Seçiniz' },
    en: { title: 'Donate', subtitle: 'Your support is valuable ❤️', moneyTab: 'Money', resourceTab: 'Items', ibanLabel: 'IBAN INFO', accountName: 'Safe Shelter', cashBtn: 'Cash Donation Center', resourceLabel: 'Item Type', quantityLabel: 'Quantity', deliveryLabel: 'Delivery', dropOffLabel: 'Center', pickupLabel: 'Pickup', submit: 'Complete', successTitle: 'Successful ❤️', successMessage: 'Thank you for your support!', goHome: 'Home', placeholderResource: 'Ex: Blankets', validationError: 'Please fill in required fields.', error: 'An error occurred, please try again.', notice: 'Donate via IBAN or visit us.', resourceNotice: 'Register your items for pickup.', unitLabel: 'Unit', selectUnit: 'Select Unit' },
    ar: { title: 'تبرع', subtitle: 'دعمكم ذو قيمة كبيرة ❤️', moneyTab: 'تبرع نقدي', resourceTab: 'تبرع بالمواد', ibanLabel: 'معلومات IBAN', accountName: 'Safe Shelter', cashBtn: 'مركز التبرع النقدي', resourceLabel: 'نوع المادة', quantityLabel: 'الكمية', deliveryLabel: 'تفضيل التسليم', dropOffLabel: 'تسليم في المركز', pickupLabel: 'استلام من المنزل', submit: 'إكمال التبرع', successTitle: 'تم بنجاح ❤️', successMessage: 'شكراً لدعمكم الكريم!', goHome: 'الرئيسية', placeholderResource: 'مثال: بطانيات إلخ.', validationError: 'يرجى ملء الحقول المطلوبة.', error: 'حدث خطأ ما، يرجى المحاولة مرة أخرى.', notice: 'تبرع عبر IBAN أو زر مركزنا.', resourceNotice: 'سجل موادك ليتم استلامها.', unitLabel: 'وحدة', selectUnit: 'اختر الوحدة' }
  };

  const t = translations[language as keyof typeof translations] || translations.tr;

  const handleDonation = async () => {
    if (type === 'resource' && (!resourceType || !quantity || !unit)) {
      showAlert('Hata', t.validationError, undefined, 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/donations', {
        type: type, amount: 0, resource_type: type === 'resource' ? resourceType : null,
        quantity: type === 'resource' ? `${quantity} ${unit}` : null,
        shelter_id: 1, card_id: userData?.card_id || userData?.id,
        note: note, is_anonymous: isAnonymous, delivery_mode: type === 'resource' ? deliveryMode : null,
        pickup_address: (type === 'resource' && deliveryMode === 'pickup') ? pickupAddress : null
      });
      if (response.data.success) setIsSubmitted(true);
    } catch (error: any) {
      showAlert('Hata', t.error, undefined, 'error');
    } finally { setIsSubmitting(false); }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4' }]}>
            <CheckCircle size={80} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.primary }]}>{t.successTitle}</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>{t.successMessage}</Text>
          <TouchableOpacity style={[styles.homeBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>{t.goHome}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={[styles.tabs, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.2)' }]}>
          <TouchableOpacity style={[styles.tab, type === 'money' && { backgroundColor: '#FFF' }]} onPress={() => setType('money')}>
            <DollarSign size={18} color={type === 'money' ? colors.primary : '#FFF'} />
            <Text style={[styles.tabText, { color: type === 'money' ? colors.primary : '#FFF' }]}>{t.moneyTab}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, type === 'resource' && { backgroundColor: '#FFF' }]} onPress={() => setType('resource')}>
            <Package size={18} color={type === 'resource' ? colors.primary : '#FFF'} />
            <Text style={[styles.tabText, { color: type === 'resource' ? colors.primary : '#FFF' }]}>{t.resourceTab}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}>
          {type === 'money' ? (
            <View style={styles.moneySection}>
              <View style={styles.noticeBox}>
                <Heart size={20} color={colors.primary} fill={colors.primary} />
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{t.notice}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.ibanCard, { backgroundColor: colors.primary }]} 
                onPress={() => { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 2000); }}
                activeOpacity={0.9}
              >
                <View style={styles.cardGlow} />
                <View style={styles.cardTop}>
                  <Text style={styles.cardLogo}>SAFE SHELTER</Text>
                  <Globe size={22} color="#FFF" opacity={0.6} />
                </View>
                <View style={styles.ibanBody}>
                  <Text style={styles.ibanLabel}>{t.ibanLabel}</Text>
                  <Text style={styles.ibanValue}>TR12 3456 7890 1234 5678 9012 34</Text>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardHolder}>SAFE SHELTER FOUNDATION</Text>
                  <Zap size={20} color="#FFD700" fill="#FFD700" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionLink, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#F0F9FF' }]}>
                <MapPin size={20} color={colors.primary} />
                <Text style={[styles.actionLinkText, { color: colors.primary }]}>{t.cashBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resourceSection}>
              <View style={styles.noticeBox}>
                <Package size={20} color={colors.primary} />
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{t.resourceNotice}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t.resourceLabel}</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder={t.placeholderResource} value={resourceType} onChangeText={setResourceType} />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.label, { color: colors.text }]}>{t.unitLabel}</Text>
                  <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setIsUnitModalVisible(true)}>
                    <Text style={{ color: colors.text }}>{unit}</Text>
                    <ChevronDown size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Miktar</Text>
                  <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setIsQtyModalVisible(true)}>
                    <Text style={{ color: quantity ? colors.text : colors.textSecondary }}>{quantity || 'Seç...'}</Text>
                    <ChevronDown size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>{t.deliveryLabel}</Text>
              <View style={styles.deliveryGrid}>
                <TouchableOpacity style={[styles.deliveryBtn, deliveryMode === 'drop_off' && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]} onPress={() => setDeliveryMode('drop_off')}>
                  <MapPin size={22} color={deliveryMode === 'drop_off' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.deliveryText, { color: deliveryMode === 'drop_off' ? colors.primary : colors.textSecondary }]}>{t.dropOffLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deliveryBtn, deliveryMode === 'pickup' && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]} onPress={() => setDeliveryMode('pickup')}>
                  <Truck size={22} color={deliveryMode === 'pickup' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.deliveryText, { color: deliveryMode === 'pickup' ? colors.primary : colors.textSecondary }]}>{t.pickupLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleDonation}>
            {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Heart size={20} color="#FFF" fill="#FFF" />
                <Text style={styles.submitBtnText}>{t.submit}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showCopyToast && (
        <View style={[styles.toast, { backgroundColor: colors.primary }]}>
          <CheckCircle size={18} color="#FFF" />
          <Text style={styles.toastText}>IBAN Kopyalandı!</Text>
        </View>
      )}

      {/* Basic Modals updated with Theme */}
      <Modal visible={isQtyModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsQtyModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <FlatList data={quantityOptions} numColumns={3} renderItem={({ item }) => (
              <TouchableOpacity style={[styles.modalItem, { backgroundColor: colors.background }]} onPress={() => { setQuantity(item); setIsQtyModalVisible(false); }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item}</Text>
              </TouchableOpacity>
            )} keyExtractor={i => i} />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isUnitModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsUnitModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <FlatList data={unitOptions} numColumns={2} renderItem={({ item }) => (
              <TouchableOpacity style={[styles.modalItem, { backgroundColor: colors.background }]} onPress={() => { setUnit(item); setIsUnitModalVisible(false); }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item}</Text>
              </TouchableOpacity>
            )} keyExtractor={i => i} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.35, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 15, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  scrollContent: { paddingBottom: 40, paddingTop: 40 },
  subtitle: { fontSize: 13, color: '#93C5FD', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  tabs: { flexDirection: 'row', marginHorizontal: 24, padding: 6, borderRadius: 20, marginBottom: 25 },
  tab: { flex: 1, height: 44, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tabText: { fontSize: 14, fontWeight: '800' },
  card: { marginHorizontal: 24, borderRadius: 32, padding: 24, borderWidth: 1.5, elevation: 4 },
  noticeBox: { flexDirection: 'row', gap: 12, marginBottom: 25, paddingRight: 10 },
  noticeText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  ibanCard: { width: '100%', aspectRatio: 1.6, borderRadius: 24, padding: 24, justifyContent: 'space-between', overflow: 'hidden' },
  cardGlow: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLogo: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  ibanBody: { marginVertical: 10 },
  ibanLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '800', marginBottom: 5 },
  ibanValue: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHolder: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  actionLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 25, height: 56, borderRadius: 18 },
  actionLinkText: { fontSize: 15, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '800', marginBottom: 8, marginLeft: 4 },
  input: { height: 56, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
  dropdown: { height: 56, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deliveryGrid: { flexDirection: 'row', gap: 12, marginTop: 5 },
  deliveryBtn: { flex: 1, height: 74, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 6, borderColor: '#F1F5F9' },
  deliveryText: { fontSize: 12, fontWeight: '800' },
  submitBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 35, elevation: 3 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  toast: { position: 'absolute', bottom: 100, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 10 },
  toastText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 30 },
  modalContent: { borderRadius: 28, padding: 15, maxHeight: '50%' },
  modalItem: { flex: 1, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', margin: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIconBox: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  successTitle: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  successMessage: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  homeBtn: { height: 64, paddingHorizontal: 40, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  homeBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  moneySection: { width: '100%' },
  resourceSection: { width: '100%' },
  inputGroup: { width: '100%', marginBottom: 15 },
  row: { flexDirection: 'row', width: '100%' }
});
