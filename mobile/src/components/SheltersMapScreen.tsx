import * as Location from 'expo-location';
import {
  AlertCircle as LucideAlertCircle,
  CheckCircle as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft,
  Filter as LucideFilter,
  MapPin as LucideMapPin,
  Navigation as LucideNavigation,
  Search as LucideSearch,
  ShieldCheck as LucideShieldCheck,
  Trees as LucideTrees,
  Users as LucideUsers,
  XCircle as LucideXCircle
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { UserData } from '../types/user';
import { calculateDistance, estimateRoadDistance, formatDistanceDisplay } from '../utils/geoUtils';

// Silencing IDE errors for hybrid environment

const MapPin = LucideMapPin as any;
const Navigation = LucideNavigation as any;
const Users = LucideUsers as any;
const CheckCircle = LucideCheckCircle as any;
const XCircle = LucideXCircle as any;
const AlertCircle = LucideAlertCircle as any;
const Filter = LucideFilter as any;
const Search = LucideSearch as any;
const ChevronLeft = LucideChevronLeft as any;
const ShieldCheck = LucideShieldCheck as any;
const Trees = LucideTrees as any;

const { width, height } = Dimensions.get('window');

interface Shelter {
  id: number;
  name: string;
  type: 'main' | 'secondary';
  distance: string;
  capacity: number;
  currentOccupancy: number;
  status: 'open' | 'full' | 'closed';
  address: string;
  lat: number;
  lng: number;
}

interface SheltersMapScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  userData?: UserData;
  language?: 'tr' | 'en' | 'ar';
  route?: { params: { focusOnFriend?: any } };
}

export default function SheltersMapScreen({
  navigation,
  userData,
  language = 'tr',
  route
}: SheltersMapScreenProps) {
  const { colors, isDark } = useTheme();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'main' | 'secondary'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<any[]>([
    { id: 'f1', name: 'Canberk Özkan', lat: 40.991, lng: 29.027, status: 'inside' },
    { id: 'f2', name: 'Selin Yılmaz', lat: 40.985, lng: 29.032, status: 'outside' },
    { id: 'f3', name: 'Mert Demir', lat: 41.025, lng: 29.015, status: 'inside' }
  ]);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const latestUserLocation = useRef<Location.LocationObjectCoords | null>(null);
  const hasZoomedToUser = useRef(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  });
  const mapRef = useRef<MapView>(null);

  const zoomToUserLocation = (coords: { latitude: number; longitude: number } | null) => {
    const targetCoords = coords || latestUserLocation.current;
    if (!targetCoords || hasZoomedToUser.current || !mapRef.current) {
      console.log('zoomToUserLocation skipped:', { hasCoords: !!targetCoords, hasZoomed: hasZoomedToUser.current, hasMapRef: !!mapRef.current });
      return;
    }

    console.log('Zooming to user location:', targetCoords.latitude, targetCoords.longitude);
    hasZoomedToUser.current = true;

    const targetRegion = {
      latitude: targetCoords.latitude,
      longitude: targetCoords.longitude,
      latitudeDelta: 0.02, // Zoomed out to show wider district/town level
      longitudeDelta: 0.02
    };

    setMapRegion(targetRegion);

    // Zoom immediately
    mapRef.current.animateToRegion(targetRegion, 1000);

    // Fallback in case layout/rendering finishes slightly later
    setTimeout(() => {
      if (mapRef.current) {
        console.log('Map zoom fallback triggered');
        mapRef.current.animateToRegion(targetRegion, 800);
      }
    }, 400);
  };

  const t: any = {
    tr: { title: 'Sığınak Haritası', search: 'Sığınak ara...', allShelters: 'Tümü', mainShelters: 'Ana', secondaryShelters: 'Güvenli Yerler', distance: 'Mesafe', capacity: 'Kapasite', open: 'Açık', full: 'Dolu', closed: 'Kapalı', getDirections: 'Yol Tarifi Al', viewInternal: 'İç Harita', nearYou: 'Size yakın', available: 'Müsait', loading: 'Yükleniyor...', error: 'Veri yüklenemedi', shelterMaps: 'Sığınak Haritaları' },
    en: { title: 'Shelters Map', search: 'Search shelter...', allShelters: 'All', mainShelters: 'Main', secondaryShelters: 'Safe Places', distance: 'Distance', capacity: 'Capacity', open: 'Open', full: 'Full', closed: 'Closed', getDirections: 'Get Directions', viewInternal: 'Internal Map', nearYou: 'Near you', available: 'Available', loading: 'Loading...', error: 'Failed to load', shelterMaps: 'Shelter Maps' },
    ar: { title: 'خريطة المآوي', search: 'ابحث عن مأوى...', allShelters: 'الكل', mainShelters: 'الرئيسية', secondaryShelters: 'أماكن آمنة', distance: 'المسافة', capacity: 'السعة', open: 'مفتوح', full: 'ممتلئ', closed: 'مغلق', getDirections: 'احصل على الاتجاهات', viewInternal: 'الخريطة الداخلية', nearYou: 'بالقرب منك', available: 'متاح', loading: 'جار التحميل...', error: 'فشل التحميل', shelterMaps: 'Sığınak Haritaları' }
  }[language] || {
    title: 'Sığınak Haritası', search: 'Sığınak ara...', allShelters: 'Tümü', mainShelters: 'Ana', secondaryShelters: 'Güvenli Yerler', distance: 'Mesafe', capacity: 'Kapasite', open: 'Açık', full: 'Dolu', closed: 'Kapalı', getDirections: 'Yol Tarifi Al', viewInternal: 'İç Harita', nearYou: 'Size yakın', available: 'Müsait', loading: 'Yükleniyor...', error: 'Veri yüklenemedi', shelterMaps: 'Sığınak Haritaları'
  };

  const isRTL = language === 'ar';


  useFocusEffect(
    useCallback(() => {
      console.log('SheltersMapScreen focused: resetting zoom flag and refreshing data');
      hasZoomedToUser.current = false;
      fetchShelters();
      getUserLocation();
    }, [])
  );

  useEffect(() => {
    // Arkadaş odaklama kontrolü
    if (route?.params?.focusOnFriend) {
      hasZoomedToUser.current = true; // Prevent zooming to user location when focusing on a friend
      const f = route.params.focusOnFriend;
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: f.lat,
          longitude: f.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }, 1000);
      }, 500);
    }
  }, [route?.params?.focusOnFriend]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Harita üzerinde kendinizi görebilmek için konum izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.log('SheltersMapScreen: Location services are disabled.');
        Alert.alert(
          'Konum Servisleri Kapalı',
          'Haritada kendinizi görebilmek için lütfen cihazınızın konum servislerini (GPS) etkinleştirin.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const coords = location.coords;
      setUserLocation(coords);
      latestUserLocation.current = coords;

      const targetRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02, // Zoomed out to show wider district/town level
        longitudeDelta: 0.02
      };

      // Harita henüz render edilmeden önce state güncellenirse initialRegion burayı baz alır
      setMapRegion(targetRegion);

      // Harita yüklendikten sonra animasyonla pürüzsüz geçiş için zoom fonksiyonunu çağır
      zoomToUserLocation(coords);
    } catch (err) {
      console.log('Error getting location:', err);
    }
  };

  const fetchShelters = async () => {
    try {
      setLoading(true);

      // Ana Sığınaklar ve Güvenli Yerler için paralel çağrı
      console.log('--- FETCH BAŞLATILDI: Ana + Güvenli Yerler ---');
      const [resMain, resSecondary] = await Promise.all([
        api.get('shelters').catch(e => { console.log('Ana Sığınak API Hatası:', e.message); return { data: [] }; }),
        api.get('secondary-shelters').catch(e => { console.log('Güvenli Yerler API Hatası:', e.message); return { data: [] }; })
      ]);

      console.log('--- ANA BARINAK YANITI ---', resMain.data);
      console.log('--- GÜVENLİ YERLER YANITI ---', resSecondary.data);

      const mainRaw = resMain.data?.shelters || (Array.isArray(resMain.data) ? resMain.data : []);

      // Secondary-shelters bazen direkt liste, bazen obje içinde gelebilir
      let secondaryRaw = [];
      if (Array.isArray(resSecondary.data)) {
        secondaryRaw = resSecondary.data;
      } else if (resSecondary.data?.shelters) {
        secondaryRaw = resSecondary.data.shelters;
      } else if (resSecondary.data?.data) {
        secondaryRaw = resSecondary.data.data;
      }

      const formattedMain = mainRaw.map((s: any) => ({
        id: s.id,
        name: s.name || 'İsimsiz Sığınak',
        type: 'main',
        distance: '0 km',
        capacity: s.capacity?.total || 0,
        currentOccupancy: (s.capacity?.current || 0) + 100,
        status: s.status?.key === 'open' ? 'open' : (s.status?.key === 'full' ? 'full' : 'closed'),
        address: s.address || '-',
        lat: parseFloat(s.lat) || 0,
        lng: parseFloat(s.lng) || 0,
      }));

      const formattedSecondary = secondaryRaw.map((s: any) => {
        // Durum (Status) tespiti: Backend'den geliyorsa al, yoksa 'open' varsay (Parklar genelde açık)
        let determinedStatus: 'open' | 'full' | 'closed' = 'open';
        if (s.status === 'open' || s.status?.key === 'open' || s.is_open === true) {
          determinedStatus = 'open';
        } else if (s.status === 'full' || s.status?.key === 'full') {
          determinedStatus = 'full';
        } else if (s.status === 'closed' || s.status?.key === 'closed') {
          determinedStatus = 'closed';
        }

        return {
          id: s.id + 2000, // ID çakışmaması için daha yüksek offset
          name: s.name || 'Güvenli Yer',
          type: 'secondary',
          distance: '0 km',
          capacity: parseInt(s.capacity?.total || s.capacity || 500),
          currentOccupancy: parseInt(s.capacity?.current || 0),
          status: determinedStatus,
          address: s.address || 'Açık Alan / Güvenli Bölge',
          lat: parseFloat(s.lat) || 0,
          lng: parseFloat(s.lng) || 0,
        };
      });

      setShelters([...formattedMain, ...formattedSecondary]);
      setError(null);
    } catch (err: any) {
      setError(`${t.error}: ${err.message || 'Bilinmeyen Hata'}`);
      console.log('HATA DETAYI:', err);
    } finally {
      setLoading(false);
    }
  };

  // Moved to shared utility: src/utils/geoUtils.ts

  const filteredShelters = shelters.filter(shelter => {
    const matchesSearch = shelter.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && shelter.type === filterType;
  }).sort((a, b) => {
    if (!userLocation) return 0;
    const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.lat, a.lng);
    const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.lat, b.lng);
    return distA - distB;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open': return { color: '#16A34A', bg: isDark ? 'rgba(22, 163, 74, 0.1)' : '#DCFCE7', text: t.open };
      case 'full': return { color: '#DC2626', bg: isDark ? 'rgba(220, 38, 38, 0.1)' : '#FEE2E2', text: t.full };
      case 'closed': return { color: '#4B5563', bg: isDark ? 'rgba(75, 85, 99, 0.1)' : '#F3F4F6', text: t.closed };
      default: return { color: '#4B5563', bg: isDark ? 'rgba(75, 85, 99, 0.1)' : '#F3F4F6', text: status };
    }
  };

  const handleGetDirections = (shelter: Shelter) => {
    // Navigasyon sayfasına yönlendir - Doğru isim: 'Navigation'
    navigation.navigate('Navigation', { shelter });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

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

      {/* Search Bar Container */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Search size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.search}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          <FilterButton label={t.allShelters} active={filterType === 'all'} count={shelters.length} onPress={() => setFilterType('all')} colors={colors} />
          <FilterButton label={t.mainShelters} active={filterType === 'main'} count={shelters.filter(s => s.type === 'main').length} onPress={() => setFilterType('main')} colors={colors} />
          <FilterButton label={t.secondaryShelters} active={filterType === 'secondary'} count={shelters.filter(s => s.type === 'secondary').length} onPress={() => setFilterType('secondary')} colors={colors} />
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ padding: 60, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>{t.loading}</Text>
          </View>
        ) : error ? (
          <View style={{ padding: 60, alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={40} color="#EF4444" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '700', marginBottom: 8 }}>{t.error}</Text>
            <TouchableOpacity onPress={fetchShelters} style={[styles.primaryModalBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.primaryModalBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Real Map View */}
            <View style={[styles.mapContainer, styles.shadow, { borderColor: colors.primary }]}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                showsUserLocation={true}
                userInterfaceStyle={isDark ? 'dark' : 'light'}
                pitchEnabled={true}
                onMapReady={() => {
                  console.log("Map component onMapReady triggered");
                  zoomToUserLocation(null);
                }}
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


                {filteredShelters.map((s) => (
                  <Marker
                    key={s.id}
                    coordinate={{ latitude: s.lat, longitude: s.lng }}
                    title={s.type === 'main' ? `🛡️ ${s.name}` : `🌳 ${s.name}`}
                    description={s.address}
                    pinColor={s.type === 'main' ? "#EF4444" : "#38BDF8"}
                    onPress={() => { setSelectedShelter(s); }}
                  />
                ))}
              </MapView>
            </View>

            {/* 🛑 HARİTA ANAHTARI (LEGEND) - SADE VE ŞIK (SADECE RENKLER) */}
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
              <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Sığınak</Text>
              </View>
              <View style={[styles.legendItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Güvenli Alan</Text>
              </View>

            </ScrollView>

            <View style={styles.listSection}>
              {filteredShelters.map((shelter) => {
                const statusInfo = getStatusInfo(shelter.status);
                const occupancyRate = shelter.currentOccupancy / shelter.capacity;
                const straightDist = userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, shelter.lat, shelter.lng) : null;
                const roadDist = straightDist !== null ? estimateRoadDistance(straightDist) : null;

                const distText = roadDist !== null ? formatDistanceDisplay(roadDist) : shelter.distance;

                return (
                  <TouchableOpacity
                    key={shelter.id}
                    style={[styles.shelterCard, styles.shadow, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={() => { setSelectedShelter(shelter); }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.shelterName, { color: colors.text }]}>{shelter.name}</Text>
                        <Text style={[styles.shelterAddr, { color: colors.textSecondary }]}>{shelter.address}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        {shelter.type === 'main' && (
                          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.cardStats}>
                      <View style={styles.cardMeta}>
                        <LucideNavigation size={14} color={colors.accent} />
                        <Text style={[styles.metaLabel, { color: colors.primary }]}>{distText}</Text>
                      </View>
                      <View style={styles.cardMeta}>
                        <LucideUsers size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaLabel, { color: colors.primary }]}>{shelter.currentOccupancy}/{shelter.capacity}</Text>
                      </View>
                    </View>

                    {/* Progress Bar - Only for Main Shelters */}
                    {shelter.type === 'main' && (
                      <View style={[styles.progressContainer, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]}>
                        <View style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(occupancyRate * 100, 100)}%`,
                            backgroundColor: occupancyRate > 0.9 ? '#EF4444' : (occupancyRate > 0.7 ? '#F97316' : '#10B981')
                          }
                        ]} />
                      </View>
                    )}

                    <View style={{ flexDirection: 'row' }}>
                      {shelter.type === 'main' ? (
                        <TouchableOpacity
                          style={[styles.directionsBtn, { flex: 1, backgroundColor: colors.primary }]}
                          onPress={() => { setSelectedShelter(shelter); }}
                        >
                          <MapPin size={16} color="#FFF" />
                          <Text style={styles.directionsText}>{t.shelterMaps}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.directionsBtn, { flex: 1, backgroundColor: colors.primary }]}
                          onPress={() => handleGetDirections(shelter)}
                        >
                          <LucideNavigation size={18} color="#FFF" />
                          <Text style={styles.directionsText}>{t.getDirections} ({distText})</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Shelter Detail Modal */}
      <Modal visible={!!selectedShelter} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setSelectedShelter(null); }}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            </View>

            {selectedShelter && (
              <View style={styles.modalBody}>
                <View style={styles.modalTitleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalName, { color: colors.text }]}>{selectedShelter.name}</Text>
                    <Text style={[styles.modalAddr, { color: colors.textSecondary }]}>{selectedShelter.address}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(selectedShelter.status).bg, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.statusText, { color: getStatusInfo(selectedShelter.status).color }]}>
                      {getStatusInfo(selectedShelter.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalStatsGrid}>
                  <View style={[styles.modalStatBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>{t.distance}</Text>
                    <Text style={[styles.modalStatValue, { color: colors.text }]}>
                      {userLocation ? (
                        formatDistanceDisplay(estimateRoadDistance(calculateDistance(userLocation.latitude, userLocation.longitude, selectedShelter.lat, selectedShelter.lng)))
                      ) : selectedShelter.distance}
                    </Text>
                  </View>
                  {selectedShelter.type === 'main' && (
                    <View style={[styles.modalStatBox, { backgroundColor: colors.background }]}>
                      <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>{t.capacity}</Text>
                      <Text style={[styles.modalStatValue, { color: colors.text }]}>{selectedShelter.currentOccupancy}/{selectedShelter.capacity}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.primaryModalBtn,
                      { backgroundColor: colors.primary },
                      selectedShelter.status === 'closed' && styles.disabledBtn
                    ]}
                    onPress={() => {
                      setSelectedShelter(null);
                      handleGetDirections(selectedShelter!);
                    }}
                    disabled={selectedShelter.status === 'closed'}
                  >
                    <LucideNavigation size={22} color="#FFF" />
                    <Text style={styles.primaryModalBtnText}>
                      {t.getDirections}
                    </Text>
                  </TouchableOpacity>

                  {selectedShelter.type === 'main' && (
                    <TouchableOpacity
                      style={[styles.secondaryModalBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1 }]}
                      onPress={() => {
                        const shelterToPass = selectedShelter;
                        setSelectedShelter(null);
                        navigation.navigate('InternalMap', { shelterName: shelterToPass?.name });
                      }}
                    >
                      <Text style={[styles.secondaryModalBtnText, { color: colors.primary }]}>{t.viewInternal}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function FilterButton({ label, active, count, onPress, colors }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.filterBtn,
        { backgroundColor: colors.card, borderColor: colors.border },
        active && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterBtnText, { color: colors.textSecondary }, active && { color: '#FFF' }]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  bgHeader: { height: height * 0.26, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  searchContainer: { paddingHorizontal: 24, marginTop: -55, zIndex: 10 },
  searchBox: { borderRadius: 20, height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  filterBar: { paddingHorizontal: 24, paddingVertical: 20, gap: 10 },
  filterBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24, borderWidth: 1 },
  filterBtnText: { fontSize: 13, fontWeight: '800' },
  scrollContent: { padding: 24, paddingTop: 5 },
  mapContainer: { height: 300, borderRadius: 32, marginBottom: 24, overflow: 'hidden', borderWidth: 2 },
  map: { flex: 1 },
  listSection: { gap: 16 },
  shelterCard: { borderRadius: 28, padding: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  shelterName: { fontSize: 18, fontWeight: '800' },
  shelterAddr: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '900' },
  cardStats: { flexDirection: 'row', gap: 16, marginBottom: 15 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: 13, fontWeight: '700' },
  progressContainer: { height: 6, borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  directionsBtn: { borderRadius: 20, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  disabledBtn: { backgroundColor: '#E2E8F0' },
  directionsText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { alignItems: 'center', padding: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2 },
  modalBody: { paddingHorizontal: 24 },
  modalTitleRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  modalName: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  modalAddr: { fontSize: 14 },
  modalStatsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modalStatBox: { flex: 1, padding: 16, borderRadius: 16 },
  modalStatLabel: { fontSize: 12, marginBottom: 4, fontWeight: '600' },
  modalStatValue: { fontSize: 18, fontWeight: '800' },
  modalActions: { gap: 12 },
  primaryModalBtn: { borderRadius: 18, height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  primaryModalBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  secondaryModalBtn: { borderRadius: 18, height: 60, alignItems: 'center', justifyContent: 'center' },
  secondaryModalBtnText: { fontSize: 16, fontWeight: '700' },
  legendWrapper: { marginBottom: 16, marginTop: -4 },
  legendContent: { gap: 12, paddingRight: 24, paddingLeft: 4 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 10, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' },
  badgeSığınak: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  badgeGüvenli: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6'
  },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#111827' },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  }
});