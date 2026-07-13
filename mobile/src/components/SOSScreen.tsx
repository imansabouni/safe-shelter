// BU DOSYA ANTIGRAVITY TARAFINDAN GÜNCELLENDİ - TEST 123
import * as Location from 'expo-location';
import {
  Activity as LucideActivity,
  AlertCircle as LucideAlertCircle,
  Ambulance as LucideAmbulance,
  Car as LucideCar,
  CheckCircle as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft,
  Flame as LucideFlame,
  MapPin as LucideMapPin,
  Navigation as LucideNavigation,
  Phone as LucidePhone,
  Send as LucideSend,
  ShieldCheck as LucideShieldCheck,
  Users as LucideUsers,
  Clock as LucideClock,
  Volume2 as LucideVolume2,
  VolumeX as LucideVolumeX
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView
} from 'react-native';
import { useApp } from '../context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { UserData } from '../types/user';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Network from 'expo-network';

// Silencing IDE errors for hybrid environment
const AlertCircle = LucideAlertCircle as any;
const Phone = LucidePhone as any;
const Ambulance = LucideAmbulance as any;
const Car = LucideCar as any;
const Users = LucideUsers as any;
const MapPin = LucideMapPin as any;
const Send = LucideSend as any;
const CheckCircle = LucideCheckCircle as any;
const ChevronLeft = LucideChevronLeft as any;
const Navigation = LucideNavigation as any;
const Flame = LucideFlame as any;
const ShieldCheck = LucideShieldCheck as any;
const ActivityIcon = LucideActivity as any;
const Volume2 = LucideVolume2 as any;
const VolumeX = LucideVolumeX as any;

const { width, height } = Dimensions.get('window');

interface SOSScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

export default function SOSScreen({
  navigation
}: SOSScreenProps) {
  const { userData, language, addPendingSosRequest } = useApp();
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'injured' | 'trapped' | 'needs_transport' | 'other'>('other');
  const [requestSent, setRequestSent] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState<string>('Konum Alınıyor...');
  const [coords, setCoords] = useState<any>(null);
  
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlinePayload, setOfflinePayload] = useState<any>(null);

  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleAlarm = async () => {
    if (isAlarmActive) {
      setIsAlarmActive(false);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } else {
      if (!permission?.granted) {
        const perm = await requestPermission();
        if (!perm.granted) {
          Alert.alert(
            language === 'tr' ? 'Kamera İzni' : 'Camera Permission',
            language === 'tr' ? 'Feneri açabilmek için kamera izni gerekiyor. Sadece ses çalınacak.' : 'Camera permission is required for the flashlight. Only alarm sound will play.'
          );
        }
      }
      
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' }, // Yüksek sesli bir alarm tonu
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        setSound(newSound);
      } catch (e) {
        console.log('Error playing sound', e);
      }
      
      setIsAlarmActive(true);
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('SOSScreen: Location services are disabled.');
          setLocationName('Kadıköy, İstanbul (GPS Kapalı)');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setCoords(loc.coords);

        // Ters Geocoding (Opsiyonel ama şık durur)
        let address = await Location.reverseGeocodeAsync(loc.coords);
        if (address[0]) {
          setLocationName(`${address[0].street || ''} ${address[0].name || ''}, ${address[0].region || ''}`);
        }
      } catch (err) {
        console.log('SOSScreen location fetch error (silenced):', err);
        setLocationName('Kadıköy, İstanbul (Konum Alınamadı)');
      }
    })();
  }, []);

  const text = {
    tr: { title: 'Acil Yardim', subtitle: 'Anında yardım talep edin', sosButton: 'ACİL DURUM SOS', injured: 'Yaralıyım', transport: 'Ulaşım Talebi', ambulance: 'Ambulans', helpOther: 'Başkası İçin Yardım', yourLocation: 'Konumunuz', requestHelp: 'Yardım Talep Et', requestType: 'Talep Türü', description: 'Açıklama', descriptionPlaceholder: 'Durumu açıklayın...', sendRequest: 'Talep Gönder', cancel: 'İptal', requestSuccess: 'Talebiniz Gönderildi', successMessage: 'Yardım ekiplerine bildirildi. En kısa sürede size ulaşacaklar.', close: 'Kapat', emergencyCall: 'Acil Arama', call112: 'Ara 112', emergencyContacts: 'Acil İletişim Numaraları', ambulanceService: 'Ambulans', fireService: 'İtfaiye', policeService: 'Polis', offlineNote: 'Çevrimdışı mod: Talepler internet bağlantısı gelince gönderilecek', getDirections: 'Yol Tarifi Al' },
    en: { title: 'Emergency Help', subtitle: 'Request immediate assistance', sosButton: 'EMERGENCY SOS', injured: 'I am Injured', transport: 'Transport Request', ambulance: 'Ambulance', helpOther: 'Help Someone Else', yourLocation: 'Your Location', requestHelp: 'Request Help', requestType: 'Type', description: 'Description', descriptionPlaceholder: 'Describe the situation...', sendRequest: 'Send Request', cancel: 'Cancel', requestSuccess: 'Request Sent', successMessage: 'Help teams have been notified. They will reach you soon.', close: 'Close', emergencyCall: 'Emergency Call', call112: 'Call 112', emergencyContacts: 'Emergency Contacts', ambulanceService: 'Ambulance', fireService: 'Fire', policeService: 'Police', offlineNote: 'Offline mode: Requests will be sent when online', getDirections: 'Get Directions' },
    ar: { title: 'مساعدة طارئة', subtitle: 'اطلب المساعدة الفورية', sosButton: 'طوارئ SOS', injured: 'أنا مصاب', transport: 'طلب نقل', ambulance: 'إسعاف', helpOther: 'مساعدة شخص آخر', yourLocation: 'موقعك', requestHelp: 'طلب مساعدة', requestType: 'نوع الطلب', description: 'الوصف', descriptionPlaceholder: 'صف الموقف...', sendRequest: 'إرسال الطلب', cancel: 'إلغاء', requestSuccess: 'تم إرسال طلبك', successMessage: 'تم إبلاغ فرق المساعدة. سيصلون إليك قريباً.', close: 'إغلاق', emergencyCall: 'مكالمة طوارئ', call112: 'اتصل 112', emergencyContacts: 'أرقام الطوارئ', ambulanceService: 'إسعاف', fireService: 'إطفاء', policeService: 'شرطة', offlineNote: 'وضع عدم الاتصال: سيتم إرسال الطلبات عند الاتصال', getDirections: 'احصل على الاتجاهات' }
  };

  const t = text[language] || text.tr;
  const isRTL = language === 'ar';

  const getTypeLabel = () => {
    switch(requestType) {
      case 'trapped': return language === 'tr' ? 'ACİL YARDIM (Yaralı / Mahsur Kaldım)' : 'EMERGENCY (Injured / Trapped)';
      case 'needs_transport': return t.transport;
      case 'other': return t.helpOther;
      case 'injured': return language === 'tr' ? 'Yaralı Bildirimi' : 'Injured Person';
      default: return requestType ? String(requestType).toUpperCase() : '';
    }
  };

  const handleRequestSubmit = async () => {
    // 1. ANINDA İNTERNET KONTROLÜ (10 Saniye Timeout Beklememek İçin)
    const networkState = await Network.getNetworkStateAsync();
    const isActuallyOffline = !networkState.isConnected; // isInternetReachable bazen Android'de yavaş olabilir, isConnected anında sonuç verir.

    let currentCoords = coords;

    if (!currentCoords) {
      setLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const enabled = await Location.hasServicesEnabledAsync();
          if (enabled) {
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            currentCoords = loc.coords;
            setCoords(loc.coords);
          }
        }
      } catch (err) {
        console.log('Retry fetch location error:', err);
      }
      setLoading(false);
    }

    if (!currentCoords) {
      Alert.alert(
        language === 'tr' ? 'Konum Gerekli' : (language === 'ar' ? 'الموقع مطلوب' : 'Location Required'),
        language === 'tr' ? 'Yardım talebi gönderebilmek için konumunuzun açık ve bulunmuş olması gereklidir.' : (language === 'ar' ? 'مطلوب الوصول إلى الموقع لإرسال طلب المساعدة.' : 'Location access is required to send a help request.')
      );
      return;
    }

    const payload: any = {
      type: requestType,
      note: description || '.',
      location: locationName,
      lat: currentCoords?.latitude,
      lng: currentCoords?.longitude,
    };

    if (userData?.card_member_id) {
      payload.card_member_id = userData.card_member_id;
    } else if (userData?.card_id) {
      payload.card_id = userData.card_id;
    } else if (userData?.id && userData?.id !== 0) {
      payload.card_member_id = userData.id;
    }

    // EĞER İNTERNET KESİNSE 10 SANİYE BEKLEMEDEN DİREKT MENÜYÜ AÇ!
    if (isActuallyOffline) {
      setOfflinePayload(payload);
      setShowOfflineModal(true);
      return;
    }

    try {
      setLoading(true);
      
      console.log("SENDING SOS PAYLOAD:", payload);

      // Misafir kullanıcılar veya kimlik bilgisi bulunmayan durumlar için simüle et
      if ((!userData?.card_member_id && !userData?.card_id && userData?.id !== 0) || userData?.id === 0) {
        setTimeout(() => {
          setLoading(false);
          setRequestSent(true);
          setTimeout(() => {
            setRequestSent(false);
            setShowRequestModal(false);
            setDescription('');
          }, 2000);
        }, 1000);
        return;
      }

      try {
        await api.post('help-requests', payload);
        
        setLoading(false);
        setRequestSent(true);
        setTimeout(() => {
          setRequestSent(false);
          setShowRequestModal(false);
          setDescription('');
        }, 2000);
      } catch(err: any) {
        setLoading(false);
        const isOffline = !err.response || 
                          err.message === 'Network Error' || 
                          err.message?.toLowerCase().includes('network') || 
                          err.code === 'ECONNABORTED' || 
                          err.response?.status === 502 || 
                          err.response?.status === 504;
                          
        if (isOffline) {
          setOfflinePayload(payload);
          setShowOfflineModal(true);
        } else {
          console.log("SOS Request Error:", err.response?.data || err.message);
          const errorMsg = err.response?.data?.message || err.message || 'Bilinmeyen Hata';
          const statusCode = err.response?.status ? ` (${err.response.status})` : '';
          
          Alert.alert(
            language === 'tr' ? 'Hata' : (language === 'ar' ? 'خطأ' : 'Error'),
            language === 'tr' ? `Talep gönderilemedi. Hata: ${errorMsg}${statusCode}` : `Could not send request. Error: ${errorMsg}${statusCode}`
          );
        }
      }
    } catch (err: any) {
      console.error("SOS REQUEST ERROR:", err.message);
      setLoading(false);
    }
  };

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header Pattern */}
      <View style={styles.bgHeader}>
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

        <View style={styles.mainContent}>
          {/* Main SOS Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setRequestType('trapped');
              setShowRequestModal(true);
            }}
            style={[styles.sosButton, styles.shadow]}
          >
            <View style={styles.sosIconBox}>
              <AlertCircle size={48} color="#FFF" />
            </View>
            <Text style={styles.sosText}>{t.sosButton}</Text>
          </TouchableOpacity>

          {/* Injured Button */}
          <TouchableOpacity
            style={[styles.fullActionBtn, styles.shadow, { marginTop: -4, marginBottom: 4, backgroundColor: '#FEF2F2', borderColor: '#EF4444', borderWidth: 2, justifyContent: 'center' }]}
            onPress={() => { setRequestType('injured'); setShowRequestModal(true); }}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EF4444' }]}>
              <ActivityIcon size={24} color="#FFF" />
            </View>
            <Text style={[styles.fullActionLabel, { color: '#B91C1C', fontSize: 16 }]}>{t.injured}</Text>
          </TouchableOpacity>

          {/* Alarm & Flashlight Toggle Button */}
          <TouchableOpacity
            style={[styles.fullActionBtn, styles.shadow, { marginTop: 4, marginBottom: 12, backgroundColor: isAlarmActive ? '#FEE2E2' : '#FFF', borderColor: isAlarmActive ? '#DC2626' : 'transparent', borderWidth: isAlarmActive ? 2 : 0, justifyContent: 'center' }]}
            onPress={toggleAlarm}
          >
            <View style={[styles.actionIconBox, { backgroundColor: isAlarmActive ? '#DC2626' : '#F59E0B' }]}>
              {isAlarmActive ? <VolumeX size={24} color="#FFF" /> : <Volume2 size={24} color="#FFF" />}
            </View>
            <Text style={[styles.fullActionLabel, { color: isAlarmActive ? '#DC2626' : '#111827', fontSize: 16 }]}>
              {isAlarmActive 
                ? (language === 'tr' ? 'Alarmı Kapat' : 'Stop Alarm') 
                : (language === 'tr' ? 'Sesli Alarm ve Feneri Aç' : 'Sound Alarm & Flashlight')}
            </Text>
          </TouchableOpacity>

          {/* 2x2 Action Grid */}
          <View style={styles.emergencyCardGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.shadow]}
              onPress={() => { setRequestType('needs_transport'); setShowRequestModal(true); }}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#3B82F6' }]}>
                <Car size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>{t.transport}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shadow]}
              onPress={() => makeCall('112')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F97316' }]}>
                <Ambulance size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>{t.ambulanceService}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shadow]}
              onPress={() => makeCall('110')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EF4444' }]}>
                <Flame size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>{t.fireService}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shadow]}
              onPress={() => makeCall('155')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#2563EB' }]}>
                <ShieldCheck size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>{t.policeService}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.fullActionBtn, styles.shadow]}
            onPress={() => { setRequestType('other'); setShowRequestModal(true); }}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#8B5CF6' }]}>
              <Users size={24} color="#FFF" />
            </View>
            <Text style={styles.fullActionLabel}>{t.helpOther}</Text>
          </TouchableOpacity>

          {/* Location Card */}
          <View style={[styles.card, styles.shadow]}>
            <View style={styles.cardHeader}>
              <View style={[styles.actionIconBox, { backgroundColor: '#3B82F6', width: 44, height: 44 }]}>
                <MapPin size={22} color="#FFF" />
              </View>
              <View>
                <Text style={styles.cardLabel}>{t.yourLocation}</Text>
                <Text style={styles.cardValue}>{locationName}</Text>
              </View>
            </View>
          </View>

          {/* Offline Notice */}
          <View style={styles.noticeBox}>
            <AlertCircle size={18} color="#9A3412" />
            <Text style={styles.noticeText}>{t.offlineNote}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Request Modal */}
      <Modal visible={showRequestModal && !requestSent} transparent animationType="slide" onRequestClose={() => setShowRequestModal(false)}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowRequestModal(false)} 
          />
          <View style={styles.modalContent}>
            <View style={{ position: 'absolute', bottom: -500, left: 0, right: 0, height: 500, backgroundColor: '#FFF' }} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{t.requestHelp}</Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.requestType}</Text>
                <View style={styles.typeSelector}>
                  <Text style={styles.typeText}>{String(getTypeLabel() || '').toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.description}</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder={t.descriptionPlaceholder}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitRequestBtn, loading && { opacity: 0.7 }]}
                onPress={handleRequestSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Send size={20} color="#FFF" />
                    <Text style={styles.submitRequestText}>{t.sendRequest}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRequestModal(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal visible={requestSent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              {isOfflineMode ? <LucideClock size={40} color="#F59E0B" /> : <LucideCheckCircle size={40} color="#16A34A" />}
            </View>
            <Text style={styles.successTitle}>
              {isOfflineMode ? (language === 'tr' ? 'Kuyruğa Alındı' : 'Queued') : t.requestSuccess}
            </Text>
            <Text style={styles.successMsg}>
              {isOfflineMode 
                ? (language === 'tr' ? 'Talebiniz kaydedildi. İnternet bağlantınız geldiğinde otomatik olarak gönderilecektir.' : t.offlineNote)
                : t.successMessage}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Custom Offline Options Modal */}
      <Modal visible={showOfflineModal} transparent animationType="slide" onRequestClose={() => setShowOfflineModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={[styles.successIconBox, { backgroundColor: '#FEF2F2', width: 72, height: 72, borderRadius: 36, marginBottom: 16 }]}>
                <AlertCircle size={36} color="#EF4444" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 12 }]}>
                {language === 'tr' ? 'İnternet Bağlantısı Yok' : 'No Internet Connection'}
              </Text>
              <Text style={[styles.successMsg, { marginBottom: 10 }]}>
                {language === 'tr' 
                  ? 'Talebinizi SMS ile anında gönderebilir veya internet bağlantısı geldiğinde otomatik gönderilmesi için kuyruğa alabilirsiniz.'
                  : 'You can send your request instantly via SMS or queue it to be sent automatically when the internet connection is restored.'}
              </Text>
            </View>
            
            <View style={{ gap: 14 }}>
              <TouchableOpacity
                style={[styles.submitRequestBtn, { backgroundColor: '#3B82F6', marginTop: 0 }]}
                onPress={() => {
                  const phoneNumber = '05364311234';
                  const msg = `ACİL YARDIM!\nTalep: ${getTypeLabel()}\nDurum: ${description || 'Belirtilmedi'}\nKonum: ${locationName}\nHarita: https://maps.google.com/?q=${coords?.latitude},${coords?.longitude}`;
                  const url = Platform.OS === 'ios' ? `sms:${phoneNumber}&body=${encodeURIComponent(msg)}` : `sms:${phoneNumber}?body=${encodeURIComponent(msg)}`;
                  Linking.openURL(url).catch(e => console.log('SMS Error', e));
                  
                  setShowOfflineModal(false);
                  setShowRequestModal(false);
                  setDescription('');
                }}
              >
                <Send size={22} color="#FFF" />
                <Text style={styles.submitRequestText}>{language === 'tr' ? 'SMS İle Gönder' : 'Send via SMS'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitRequestBtn, { backgroundColor: '#F59E0B', marginTop: 0 }]}
                onPress={() => {
                  setShowOfflineModal(false);
                  if (offlinePayload) {
                    addPendingSosRequest(offlinePayload);
                  }
                  setIsOfflineMode(true);
                  setRequestSent(true);
                  setTimeout(() => {
                    setRequestSent(false);
                    setShowRequestModal(false);
                    setDescription('');
                    setIsOfflineMode(false);
                  }, 2500);
                }}
              >
                <LucideClock size={22} color="#FFF" />
                <Text style={styles.submitRequestText}>{language === 'tr' ? 'İnterneti Bekle (Kuyruğa Al)' : 'Wait for Internet'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCancelBtn, { marginTop: 5 }]}
                onPress={() => setShowOfflineModal(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {permission?.granted && (
        <CameraView 
          style={{ width: 1, height: 1, position: 'absolute', top: -10, left: -10, opacity: 0 }} 
          enableTorch={isAlarmActive} 
          facing="back"
        />
      )}
    </SafeAreaView>
  );
}

function ContactRow({ label, number, onCall }: any) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={() => onCall(number)}>
      <Text style={styles.contactLabel}>{label}</Text>
      <View style={styles.contactRight}>
        <Text style={styles.contactNumber}>{number}</Text>
        <Phone size={16} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.32, backgroundColor: '#EF4444', borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 45 : 60, paddingBottom: 15, zIndex: 100 },
  headerTitleBox: { alignItems: 'center' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#FECACA', fontWeight: '800', textAlign: 'center', opacity: 0.9, letterSpacing: 1, marginBottom: 10 },
  scrollContent: { paddingTop: 10, paddingBottom: 40 },
  mainContent: { padding: 24, gap: 16, paddingTop: 10 },
  sosButton: {
    backgroundColor: '#EF4444',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  sosIconBox: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  sosText: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  quickActions: { flexDirection: 'row', gap: 12 },
  emergencyCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: { flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, alignItems: 'center', gap: 10 },
  actionIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
  actionSub: { fontSize: 13, fontWeight: '800', color: '#6B7280' },
  fullActionBtn: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  fullActionLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardIconBox: { width: 40, height: 40, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  cardValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  mapPlaceholder: { height: 120, backgroundColor: '#F3F4F6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  emergencyBox: { backgroundColor: '#EF4444', borderRadius: 24, padding: 20 },
  emergencyTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 16 },
  callBtn: { backgroundColor: '#FFF', borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  callBtnText: { color: '#EF4444', fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 16 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  contactLabel: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  contactRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactNumber: { fontSize: 18, fontWeight: '800', color: '#111827' },
  noticeBox: { backgroundColor: '#FFF7ED', borderLeftWidth: 4, borderLeftColor: '#F97316', padding: 16, borderRadius: 12 },
  noticeText: { fontSize: 12, color: '#9A3412', lineHeight: 18, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  modalForm: { gap: 16 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  typeSelector: { backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  typeText: { fontWeight: '800', color: '#111827' },
  textArea: { backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, minHeight: 100, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  submitRequestBtn: { backgroundColor: '#EF4444', borderRadius: 16, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  primaryModalBtn: { backgroundColor: '#3B82F6', borderRadius: 18, height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  submitRequestText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  modalCancelBtn: { height: 50, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { color: '#6B7280', fontWeight: '600' },
  successCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 32, alignItems: 'center', marginHorizontal: 24 },
  successIconBox: { width: 64, height: 64, backgroundColor: '#DCFCE7', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 8 },
  successMsg: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
      android: { elevation: 5 }
    })
  }
});
