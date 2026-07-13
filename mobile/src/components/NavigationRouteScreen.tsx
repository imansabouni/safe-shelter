import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import {
  Activity as LucideActivity,
  AlertCircle as LucideAlertCircle,
  ChevronLeft as LucideChevronLeft,
  Clock as LucideClock,
  Compass as LucideCompass,
  MapPin as LucideMapPin,
  Navigation as LucideNavigation,
  ShieldAlert as LucideShieldAlert,
  ShieldCheck as LucideShieldCheck,
  Trees as LucideTrees,
  User as LucideUser,
  Users as LucideUsers,
  X as LucideX,
  Zap as LucideZap
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { calculateDistance, estimateRoadDistance, formatDistanceDisplay } from '../utils/geoUtils';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCmu3ueHWE6ZU8t1AzB3_sL5U1hk_ciCtw';

// Silencing IDE errors for hybrid environment
const Navigation = LucideNavigation as any;
const MapPin = LucideMapPin as any;
const Clock = LucideClock as any;
const AlertCircle = LucideAlertCircle as any;
const ChevronLeft = LucideChevronLeft as any;
const ShieldCheck = LucideShieldCheck as any;
const ShieldAlert = LucideShieldAlert as any;
const Zap = LucideZap as any;
const Activity = LucideActivity as any;
const Compass = LucideCompass as any;
const Users = LucideUsers as any;
const User = LucideUser as any;
const Trees = LucideTrees as any;
const XIcon = LucideX as any;

const { width, height } = Dimensions.get('window');

export default function NavigationRouteScreen({
  navigation,
  route,
  userData,
  language = 'tr'
}: any) {
  const { colors, isDark } = useTheme();
  const selectedShelter = route?.params?.shelter || userData?.nearestShelter;
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nearbyShelters, setNearbyShelters] = useState<any[]>([]);
  const [rawSecondaryShelters, setRawSecondaryShelters] = useState<any[]>([]);
  const [allFriends, setAllFriends] = useState<any[]>([]);
  const [friendAlert, setFriendAlert] = useState<any>(null);
  const [alertTimestamps, setAlertTimestamps] = useState<Record<string, number>>({});
  const [showNearby, setShowNearby] = useState(false);
  const [activeDest, setActiveDest] = useState<any>(selectedShelter);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  });
  const mapRef = useRef<MapView>(null);
  const hasFittedRoute = useRef(false);

  const text = {
    tr: { title: 'Navigasyon', destination: 'Varış Noktası', currentLocation: 'Mevcut Konumunuz', eta: 'Varış', minutes: 'dk', distance: 'Mesafe', capacity: 'Kapasite', status: 'Durum', available: 'Müsait', full: 'Dolu', rerouting: 'Yeniden yönlendiriliyor...', shelterFull: 'Sığınak dolu - Alternatif öneriliyor', alternative: 'Alternatif Sığınak', accept: 'Kabul Et', decline: 'Reddet', emergency: 'Acil Durum', call: 'Ara 112', directions: 'Yönlendirmeler' },
    en: { title: 'Navigation', destination: 'Destination', currentLocation: 'Location', eta: 'ETA', minutes: 'min', distance: 'Dist', capacity: 'Cap', status: 'Status', available: 'Avail', full: 'Full', rerouting: 'Rerouting...', shelterFull: 'Shelter full - Suggesting alt', alternative: 'Alt Shelter', accept: 'Accept', decline: 'Decline', emergency: 'Emergency', call: 'Call 112', directions: 'Directions' },
    ar: { title: 'الملاحة', destination: 'الوجهة', currentLocation: 'موقعك', eta: 'الوصول', minutes: 'د', distance: 'المسافة', capacity: 'السعة', status: 'الحالة', available: 'متاح', full: 'مكتمل', rerouting: 'إعادة التوجيه...', shelterFull: 'المأوى ممتلئ - اقتراح بديل', alternative: 'مأوى بديل', accept: 'قبول', decline: 'رفض', emergency: 'طوارئ', call: 'اتصل 112', directions: 'الاتجاهات' }
  };

  const t = (text as any)[language] || text.tr;
  const isRTL = language === 'ar';

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => (prev !== null ? Math.max(0, prev - 1) : null));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // CANLI KONUM TAKİBİ (Hep aktif olsun diye)
  useEffect(() => {
    let watchSubscription: any;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('NavigationRouteScreen startWatching: Location services are disabled.');
          return;
        }

        watchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5, // 5 metrede bir güncelle
          },
          (location) => {
            setUserLocation(location.coords);
            const now = new Date();
            setLastUpdate(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        );
      } catch (err) {
        console.log('NavigationRouteScreen startWatching error:', err);
      }
    };

    startWatching();
    return () => {
      if (watchSubscription) watchSubscription.remove();
    };
  }, []);

  useEffect(() => {
    hasFittedRoute.current = false;
    getUserLocation();
    fetchFriendsData();
    setActiveDest(selectedShelter);
  }, [selectedShelter?.id]);

  useEffect(() => {
    if (mapRef.current && userLocation && activeDest?.lat && !hasFittedRoute.current) {
      console.log('NavigationRouteScreen: Fitting route coordinates.');
      hasFittedRoute.current = true;
      mapRef.current.fitToCoordinates([
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: parseFloat(activeDest.lat), longitude: parseFloat(activeDest.lng) }
      ], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [userLocation, activeDest]);

  // Moved to shared utility: src/utils/geoUtils.ts

  const getUserLocation = async () => {
    try {
      setIsUpdating(true);
      hasFittedRoute.current = false; // Reset to allow re-fitting on manual update request
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsUpdating(false);
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.log('NavigationRouteScreen: Location services are disabled.');
        setIsUpdating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      setUserLocation(location.coords);

      const now = new Date();
      setLastUpdate(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      const destLat = parseFloat(activeDest?.lat || selectedShelter?.lat || 40.991);
      const destLng = parseFloat(activeDest?.lng || selectedShelter?.lng || 29.027);

      const dist = calculateDistance(location.coords.latitude, location.coords.longitude, destLat, destLng);
      const roadEstimate = estimateRoadDistance(dist);
      setDistance(roadEstimate);
      setEta(Math.ceil(roadEstimate * 12)); // Updated to 12 mins per km for standard walking

      setMapRegion({
        latitude: (location.coords.latitude + destLat) / 2,
        longitude: (location.coords.longitude + destLng) / 2,
        latitudeDelta: Math.abs(location.coords.latitude - destLat) * 2 + 0.01,
        longitudeDelta: Math.abs(location.coords.longitude - destLng) * 2 + 0.01,
      });
      setIsUpdating(false);
      fetchNearbyShelters();
    } catch (err) {
      console.log('Error getting location:', err);
      setIsUpdating(false);
    }
  };

  const getDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    brng = (brng + 360) % 360;

    const directions = ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'];
    const index = Math.round(brng / 45) % 8;
    return directions[index];
  };

  // Konum değiştikçe mesafeleri otomatik hesapla (Daha yakın olanlar hep güncel kalsın)
  useEffect(() => {
    if (userLocation && rawSecondaryShelters.length > 0) {
      const mapped = rawSecondaryShelters
        .map((s: any) => ({
          ...s,
          dist: estimateRoadDistance(calculateDistance(userLocation.latitude, userLocation.longitude, parseFloat(s.lat), parseFloat(s.lng)))
        }))
        .filter((s: any) => s.id !== activeDest?.id)
        .sort((a: any, b: any) => a.dist - b.dist)
        .slice(0, 3);

      setNearbyShelters(mapped);
    }
  }, [userLocation, rawSecondaryShelters, activeDest?.id]);

  const fetchNearbyShelters = async () => {
    try {
      // Sığınaklar değil, SADECE Güvenli Yerler (Secondary-shelters) çıksın
      const res = await api.get('/secondary-shelters');
      const data = res.data;

      let raw = [];
      if (Array.isArray(data)) {
        raw = data;
      } else if (data.shelters) {
        raw = data.shelters;
      } else if (data.data) {
        raw = data.data;
      }

      setRawSecondaryShelters(raw);
    } catch (err) {
      console.log('Error fetching nearby safe places:', err);
    }
  };

  const fetchFriendsData = async () => {
    try {
      // User data usually has user_code. If not, fallback to ZRICVS from mock
      const uCode = userData?.userId || 'ZRICVS';
      const res = await api.get(`/friends/${uCode}`);
      const data = res.data;
      setAllFriends(data.friends || []);
    } catch (err) {
      console.log('Error fetching friends for alert:', err);
    }
  };

  // Arkadaş yakınlık kontrolü (5 dakikada bir tekrarlanabilir)
  useEffect(() => {
    if (userLocation && allFriends.length > 0) {
      const now = Date.now();
      allFriends.forEach(f => {
        const lastTime = alertTimestamps[f.id] || 0;
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastTime > fiveMinutes) {
          const dist = calculateDistance(userLocation.latitude, userLocation.longitude, parseFloat(f.lat), parseFloat(f.lng));
          if (dist < 0.2) { // 200 metre
            setFriendAlert(f);
            setAlertTimestamps(prev => ({
              ...prev,
              [f.id]: now
            }));
          }
        }
      });
    }
  }, [userLocation, allFriends, alertTimestamps]);

  const openMaps = () => {
    const target = activeDest || selectedShelter;
    
    const dLat = target?.lat || target?.latitude || target?.lat_coord || target?.coords?.latitude;
    const dLng = target?.lng || target?.longitude || target?.lng_coord || target?.coords?.longitude;

    if (!dLat || !dLng) {
      if (target?.type === 'friend') {
        Alert.alert("Konum Paylaşılmamış", `${target.name} henüz konumunu paylaşmamış. Arkadaşınızın konum paylaş özelliğini açması gerekiyor.`);
      } else {
        Alert.alert("Hata", "Bu hedefin koordinat bilgileri eksik veya hatalı.");
      }
      return;
    }

    if (!userLocation) {
      Alert.alert("Konum Bekleniyor", "Mevcut konumunuz henüz alınamadı.");
      return;
    }

    const sLat = userLocation.latitude;
    const sLng = userLocation.longitude;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${sLat},${sLng}&destination=${dLat},${dLng}&travelmode=walking`;

    Linking.openURL(url).catch(err => {
      Alert.alert("Hata", "Harita uygulaması başlatılamadı.");
    });
  };

  useEffect(() => {
    if (userLocation && activeDest?.lat) {
      fetchRealDirections(userLocation, { lat: parseFloat(activeDest.lat), lng: parseFloat(activeDest.lng) });
    }
  }, [userLocation, activeDest]);

  // ANLIK HESAPLAMA (Seçim anında hemen güncellenmesi için)
  useEffect(() => {
    if (userLocation && activeDest?.lat) {
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, parseFloat(activeDest.lat), parseFloat(activeDest.lng));
      const roadEstimate = estimateRoadDistance(dist);
      setDistance(roadEstimate);
      setEta(Math.ceil(roadEstimate * 12));
    }
  }, [activeDest]); // Sadece hedef değiştiğinde bile anında çalışsın

  const fetchRealDirections = async (origin: any, destination: any) => {
    try {
      const mode = 'walking';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.lat},${destination.lng}&mode=${mode}&language=${language}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        setDistance(data.routes[0].legs[0].distance.value / 1000);
        setEta(Math.ceil(data.routes[0].legs[0].duration.value / 60));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {friendAlert && (
        <View style={styles.alertOverlay}>
          <TouchableOpacity
            style={[styles.friendAlertCard, styles.shadow, { backgroundColor: isDark ? colors.card : '#FFF', borderColor: colors.primary }]}
            activeOpacity={0.9}
            onPress={() => {
              setFriendAlert(null);
              navigation.navigate('Friends');
            }}
          >
            <View style={[styles.friendAlertIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.friendAlertTitle, { color: colors.text }]}>{friendAlert.name} Yakında!</Text>
              <Text style={[styles.friendAlertSub, { color: colors.textSecondary }]}>Arkadaşın şu an 200m mesafede.</Text>
            </View>
            <TouchableOpacity
              style={styles.alertCloseBtn}
              onPress={() => setFriendAlert(null)}
            >
              <XIcon size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      {/* Premium Header */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
        
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#FFF" style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* 1. Sabit Harita Kartı (Eski Şık Hali ile Sabitlendi) */}
      <View style={styles.fixedMapWrapper}>
        <View style={[styles.mapContainer, styles.shadow, { borderColor: colors.primary }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation={true}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
            pitchEnabled={true}
          >
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
                }}
                title="Konumum"
                pinColor="#1E3A8A"
              />
            )}


            {userLocation && activeDest?.lat && (
              <Polyline
                coordinates={[
                  { latitude: userLocation.latitude, longitude: userLocation.longitude },
                  { latitude: parseFloat(activeDest.lat), longitude: parseFloat(activeDest.lng) }
                ]}
                strokeColor={isDark ? colors.accent : "rgba(30, 58, 138, 0.8)"}
                strokeWidth={5}
              />
            )}

            {activeDest?.lat && (
              <Marker
                coordinate={{
                  latitude: parseFloat(activeDest.lat),
                  longitude: parseFloat(activeDest.lng)
                }}
                title={activeDest?.type === 'friend' ? `👤 ${activeDest.name}` : `🏘️ ${activeDest.name}`}
                pinColor="#EF4444"
              />
            )}

            {/* Yakındaki Güvenli Yerler İmleri (Eğer Açıksa) */}
            {showNearby && nearbyShelters.map(s => {
              const isCloser = distance && s.dist < distance;
              return (
                <Marker
                  key={`marker-${s.id}`}
                  coordinate={{
                    latitude: parseFloat(s.lat),
                    longitude: parseFloat(s.lng)
                  }}
                  title={isCloser ? `🌳 ${s.name} (Daha Yakın)` : `🌳 ${s.name}`}
                  pinColor={isCloser ? "#10B981" : "#38BDF8"}
                  description={isCloser ? "Daha Yakın" : `${s.dist.toFixed(1)} km`}
                />
              );
            })}
          </MapView>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1.5 Harita Lejantı (Renklerin Anlamı) */}
        {!route?.params?.hideNearby && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.legendWrapper}
            contentContainerStyle={styles.legendContent}
          >
            <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.legendDot, { backgroundColor: '#1E3A8A' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>📍 Konumum</Text>
            </View>
            {activeDest?.type !== 'friend' && (
              <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Sığınak</Text>
              </View>
            )}
            {activeDest?.type !== 'friend' && (
              <>
                <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Güvenli Alan</Text>
                </View>
                <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Daha Yakın</Text>
                </View>
              </>
            )}
            {activeDest?.type === 'friend' && (
              <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>👤 Arkadaşım</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* 2. Varış Paneli (Ad + Mesafe TEK KART) */}
        <View style={[styles.card, styles.shadow, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.destHeader}>
            <View style={[styles.destIconBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]}>
              {activeDest?.type === 'friend' ? (
                <User size={20} color={colors.accent} />
              ) : (
                <ShieldCheck size={20} color={colors.accent} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.destName, { color: colors.text }]}>{activeDest?.name || t.destination}</Text>
              <Text style={[styles.destAddr, { color: colors.textSecondary }]}>{activeDest?.address || ''}</Text>
            </View>
            <TouchableOpacity 
              onPress={getUserLocation} 
              disabled={isUpdating}
              style={[styles.miniUpdateBtn, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#F1F5F9' }]}
            >
              <LucideActivity size={18} color={isUpdating ? colors.textSecondary : colors.primary} style={isUpdating ? { opacity: 0.5 } : null} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <View style={styles.etaRow}>
            <View style={styles.etaItem}>
              <LucideClock size={16} color="#16A34A" />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.eta}</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{eta ? `${eta} ${t.minutes}` : '--'}</Text>
              </View>
            </View>
            <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />
            <View style={styles.etaItem}>
              <LucideNavigation size={16} color={colors.accent} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t.distance}</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  {distance ? formatDistanceDisplay(distance) : '--'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.mainNavBtn, { backgroundColor: colors.primary }]} onPress={openMaps}>
          <Navigation size={22} color="#FFF" />
          <Text style={styles.mainNavBtnText}>Google Maps ile Başlat</Text>
        </TouchableOpacity>
        {/* 7. Bana Yakın Diğer Güvenli Yerler (Dinamik) */}
        {activeDest?.type !== 'friend' && !route?.params?.hideNearby && (
          <View style={styles.nearbySection}>
            <TouchableOpacity
              style={[styles.nearbyToggleBtn, styles.shadow, { backgroundColor: colors.card, borderColor: colors.primary }, showNearby && { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!showNearby && nearbyShelters.length === 0 && userLocation) {
                  fetchNearbyShelters();
                }
                setShowNearby(!showNearby);
              }}
            >
              <View style={styles.nearbyHeader}>
                <LucideMapPin size={22} color={showNearby ? "#FFF" : colors.accent} />
                <Text style={[styles.nearbyTitle, { color: colors.text }, showNearby && { color: '#FFF' }]}>
                  {showNearby ? 'Gizle' : 'Yakındaki Güvenli Yerler'}
                </Text>
              </View>
            </TouchableOpacity>

            {showNearby && nearbyShelters.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyScroll}>
                {nearbyShelters.map((s) => {
                  const isCloser = distance && s.dist < distance;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.nearbyCard, styles.shadow, { backgroundColor: colors.card, borderColor: colors.border }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        const newTarget = {
                          ...s,
                          lat: parseFloat(s.lat),
                          lng: parseFloat(s.lng),
                          address: s.address || 'Alternatif Güvenli Alan'
                        };
                        setActiveDest(newTarget);
                        setShowNearby(false); // Listeyi gizle
                      }}
                    >
                      {isCloser && (
                        <View style={[styles.closerBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7', borderColor: '#22C55E' }]}>
                          <Text style={styles.closerBadgeText}>Daha Yakın</Text>
                        </View>
                      )}
                      <Text style={[styles.nearbyName, { color: colors.text }, isCloser ? { marginTop: 4 } : {}]} numberOfLines={1}>
                        {s.name} ({formatDistanceDisplay(s.dist)})
                      </Text>
                      <View style={[styles.selectBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                        <Text style={[styles.selectBtnText, { color: colors.primary }]}>Buraya Git ➔</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.22, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  fixedMapWrapper: { padding: 16, paddingBottom: 0, marginTop: 25 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, gap: 16 },
  legendWrapper: { marginBottom: -4, marginTop: -4 },
  legendContent: { gap: 12, paddingRight: 20 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  mapContainer: { height: 260, borderRadius: 32, overflow: 'hidden', borderWidth: 2 },
  map: { flex: 1 },
  card: { borderRadius: 28, padding: 16, borderWidth: 1 },
  destHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  destIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  destName: { fontSize: 13, fontWeight: '900', marginBottom: 2 },
  destAddr: { fontSize: 11 },
  cardDivider: { height: 1, marginVertical: 16 },
  etaRow: { flexDirection: 'row', alignItems: 'center' },
  etaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 10, fontWeight: '800', marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 17, fontWeight: '900' },
  innerDivider: { width: 1, height: 30, marginHorizontal: 15 },
  directionCard: {
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderWidth: 1,
  },
  directionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  directionText: { fontSize: 13, fontWeight: '800', flex: 1 },
  mainNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 12,
  },
  mainNavBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  techRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  updateLocBtn: {
    borderWidth: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  miniUpdateBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  updateLocBtnText: { fontSize: 14, fontWeight: '900' },
  lastUpdateTime: { fontSize: 10, color: '#94A3B8', fontWeight: '800', fontStyle: 'italic' },
  nearbySection: { marginTop: 8 },
  nearbyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nearbyTitle: { fontSize: 16, fontWeight: '900' },
  closerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
  },
  closerBadgeText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  nearbyToggleBtn: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12
  },
  nearbyScroll: { gap: 16, paddingBottom: 10, paddingHorizontal: 4 },
  nearbyCard: { width: 220, padding: 20, borderRadius: 24, borderWidth: 1 },
  nearbyName: { fontSize: 14, fontWeight: '800', flex: 1, marginBottom: 16 },
  selectBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  selectBtnText: { fontSize: 13, fontWeight: '900' },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
      android: { elevation: 5 }
    })
  },
  alertOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 130,
    left: 20,
    right: 20,
    zIndex: 999
  },
  friendAlertCard: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  friendAlertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  friendAlertTitle: {
    fontSize: 14,
    fontWeight: '900'
  },
  friendAlertSub: {
    fontSize: 11,
    fontWeight: '400'
  },
  alertCloseBtn: {
    padding: 4
  }
});
