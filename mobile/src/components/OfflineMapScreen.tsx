import * as Location from 'expo-location';
import { ChevronLeft, Map as LucideMap, Navigation, Compass, ArrowUpRight, ArrowUp, ArrowLeft, ArrowRight, CheckCircle2, RefreshCcw, AlertTriangle, ArrowRightCircle, WifiOff, Zap, ShieldCheck } from 'lucide-react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import MapView, { LocalTile, Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PathFinder from 'geojson-path-finder';
import { point } from '@turf/helpers';

const sefakoyGeoJSON = require('../../assets/routing/sefakoy_roads.json');
const tepekentGeoJSON = require('../../assets/routing/tepekent_roads.json');

const { width, height } = Dimensions.get('window');

// Mesafe hesaplama
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Yön (Bearing) hesaplama
const calculateBearingDegrees = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const findNearestGraphNode = (lat: number, lng: number, geojson: any) => {
  let nearestCoord = null;
  let minDist = Infinity;
  for (const feature of geojson.features) {
    if (feature.geometry.type === 'LineString') {
      for (const coord of feature.geometry.coordinates) {
        const dist = calculateDistance(lat, lng, coord[1], coord[0]);
        if (dist < minDist) {
          minDist = dist;
          nearestCoord = coord;
        }
      }
    }
  }
  return nearestCoord;
};

const generateOfflineInstructions = (coords: any[]) => {
  if (!coords || coords.length < 2) return "Hedefe ilerleyin";
  
  let instructions: string[] = [];
  let currentDir = "Düz";
  let currentDist = 0;
  let prevBearing: number | null = null;
  
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i+1];
    
    const dist = calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude) * 1000;
    const bearing = calculateBearingDegrees(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    
    if (prevBearing === null) {
      currentDist += dist;
    } else {
      let diff = bearing - prevBearing;
      diff = (diff + 540) % 360 - 180;
      
      if (Math.abs(diff) < 45) { 
        currentDist += dist;
      } else {
        if (Math.round(currentDist) > 5) {
           instructions.push(`${currentDir === "Düz" ? "Düz" : currentDir + " dönüp"} ${Math.round(currentDist)}m ${currentDir === "Düz" ? "gidin" : "ilerleyin"}`);
        }
        
        if (diff >= 45 && diff <= 135) {
          currentDir = "Sağa";
        } else if (diff <= -45 && diff >= -135) {
          currentDir = "Sola";
        } else {
          currentDir = "U dönüşü yapıp";
        }
        currentDist = dist;
      }
    }
    if (dist > 5 || prevBearing === null) {
      prevBearing = bearing;
    }
  }
  
  if (Math.round(currentDist) > 5) {
    instructions.push(`${currentDir === "Düz" ? "Düz" : currentDir + " dönüp"} ${Math.round(currentDist)}m ${currentDir === "Düz" ? "gidin" : "ilerleyin"}`);
  }
  
  instructions.push("Hedefe Varın");
  
  return instructions.slice(0, 3).join(" → ") + (instructions.length > 3 ? " → ..." : "");
};

export default function OfflineMapScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const mapType = route?.params?.mapType || 'shelter'; // 'shelter' | 'school'
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<any>(null);
  const [osrmRoute, setOsrmRoute] = useState<any[]>([]);
  const [osrmInstructions, setOsrmInstructions] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let subscription: any;
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('OfflineMapScreen: Location services are disabled.');
          return;
        }

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 2 },
          (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
        );
      } catch (err) {
        console.log('OfflineMapScreen watchPosition error:', err);
      }
    })();
    return () => subscription?.remove();
  }, [mapType]);

  const rawShelters = [
    { id: 1, lat: 41.0083, lng: 28.7800, name: "Güvercin Cd. Güvenli Alan" },
    { id: 2, lat: 41.0019, lng: 28.7760, name: "Şahin Cd. Toplanma Alanı" },
    { id: 3, lat: 41.0139, lng: 28.7880, name: "Bülbül Sk. Parkı" },
    { id: 4, lat: 41.0123, lng: 28.7720, name: "İskete Sk. Açık Alan" },
    { id: 5, lat: 40.9979, lng: 28.7920, name: "Mavikuş Sk. Güvenli Bölge" },
    { id: 6, lat: 40.9939, lng: 28.7800, name: "Alakarga Sk. Toplanma Yeri" },
    { id: 7, lat: 41.0179, lng: 28.7960, name: "Bayraktar Cd. Parkı" },
    { id: 8, lat: 41.0059, lng: 28.8000, name: "Anadolu Sokağı Meydanı" },
    { id: 9, lat: 40.9899, lng: 28.7720, name: "Kiptaş Sefaköy Güvenli Alan" },
    { id: 10, lat: 41.0155, lng: 28.7680, name: "Çalıkuşu Sk. Parkı" },
  ];

  const rawSchools = [
    { id: 1, lat: 41.0543, lng: 28.5005, name: "Arel Üni. Ana Kampüs (Güvenli Bölge)" },
    { id: 2, lat: 41.0585, lng: 28.5005, name: "Arel Mühendislik Fakültesi" },
    { id: 3, lat: 41.0501, lng: 28.5005, name: "Arel Öğrenci Yurdu - A Blok" },
    { id: 4, lat: 41.0461, lng: 28.5005, name: "Arel Öğrenci Yurdu - B Blok" },
    { id: 5, lat: 41.0543, lng: 28.5055, name: "Arel Spor Kompleksi" },
    { id: 6, lat: 41.0543, lng: 28.5105, name: "Arel Merkez Kütüphanesi" },
    { id: 7, lat: 41.0543, lng: 28.4955, name: "Tepekent Kültür Merkezi" },
    { id: 8, lat: 41.0625, lng: 28.5005, name: "Arel İktisadi İdari Bilimler" },
    { id: 9, lat: 41.0543, lng: 28.4905, name: "Arel Sağlık Bilimleri Y.O." },
    { id: 10, lat: 41.0573, lng: 28.5045, name: "Tepekent Güvenli Parkı" },
    { id: 11, lat: 41.0603, lng: 28.5085, name: "Arel İletişim Fakültesi" },
    { id: 12, lat: 41.0513, lng: 28.4965, name: "Arel Sosyal Tesisler" },
    { id: 13, lat: 41.0483, lng: 28.4925, name: "Tepekent Aile Sağlığı Merkezi" },
    { id: 14, lat: 41.0573, lng: 28.4965, name: "Arel Teknoloji Laboratuvarı" },
    { id: 15, lat: 41.0603, lng: 28.4925, name: "Arel Açık Hava Amfi Tiyatro" },
    { id: 16, lat: 41.0513, lng: 28.5045, name: "Tepekent Kapalı Spor Salonu" },
    { id: 17, lat: 41.0483, lng: 28.5085, name: "Arel Yabancı Diller Y.O." },
    { id: 18, lat: 41.0558, lng: 28.5025, name: "Tepekent Gençlik Meydanı" },
    { id: 19, lat: 41.0528, lng: 28.4985, name: "Arel Rektörlük Binası" },
    { id: 20, lat: 41.0555, lng: 28.4975, name: "Tepekent Acil Toplanma Alanı" },
  ];

  const rawPoints = mapType === 'school' ? rawSchools : rawShelters;

  const getAllSheltersWithInfo = () => {
    if (!userLocation) {
      return rawPoints.map((s, index) => ({ 
        ...s, 
        name: (s as any).name || (mapType === 'school' ? `Okul ${index + 1}` : `Sığınak ${index + 1}`), 
        distance: 0 
      }));
    }
    return rawPoints.map(s => ({
      ...s,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, s.lat, s.lng)
    })).sort((a, b) => a.distance - b.distance).map((s, index) => ({
      ...s,
      name: (s as any).name || (index === 0 ? (mapType === 'school' ? "En Yakın Okul" : "En Yakın Sığınak") : (mapType === 'school' ? `Yakın ${index + 1}. Okul` : `Yakın ${index + 1}. Sığınak`))
    }));
  };

  const allShelters = getAllSheltersWithInfo();
  const top5Shelters = allShelters.slice(0, 5);
  const top5Ids = top5Shelters.map(s => s.id);
  const mapCenter = mapType === 'school'
    ? { latitude: 41.0543, longitude: 28.5005 }
    : { latitude: 41.0083, longitude: 28.7800 };

  const isBetterShelterAvailable = () => {
    if (!selectedShelter || allShelters.length === 0) return false;
    const closestDist = allShelters[0].distance;
    return selectedShelter.distance > closestDist + 0.05;
  };

  const renderStyledText = (text: string) => {
    const parts = text.split(/(\d+m|Sağa|Sola|Düz|Varın|Hedefe|Sığınak Kapısındasınız)/g);
    return parts.map((part, i) => {
      const isSpecial = /\d+m|Sağa|Sola|Düz|Varın|Hedefe|Sığınak Kapısındasınız/.test(part);
      return (
        <Text key={i} style={[isSpecial ? styles.highlightText : null, { color: isSpecial ? colors.primary : colors.text }]}>
          {part}
        </Text>
      );
    });
  };



  const handleSelectShelter = (shelter: any) => {
    const shelterWithDist = { ...shelter, distance: userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, shelter.lat, shelter.lng) : 0 };
    setSelectedShelter(shelterWithDist);
    if (userLocation) {
      const bearing = calculateBearingDegrees(userLocation.latitude, userLocation.longitude, shelter.lat, shelter.lng);
      mapRef.current?.animateCamera({ center: { latitude: userLocation.latitude, longitude: userLocation.longitude }, pitch: 90, zoom: 18, heading: bearing }, { duration: 1000 });
    }
  };

  const resetView = () => mapRef.current?.animateCamera({ pitch: 0, heading: 0, zoom: 15 }, { duration: 1000 });
  
  let navInfo = null;
  if (selectedShelter && userLocation) {
    if (selectedShelter.distance < 0.02) {
      navInfo = { 
        main: mapType === 'school' ? "Okul Kapısındasınız." : "Sığınak Kapısındasınız.", 
        sub: mapType === 'school' ? "Güvenli okul alanına ulaştınız." : "Güvenli bölgeye ulaştınız.", 
        icon: <CheckCircle2 size={24} color="#FFF" /> 
      };
    } else if (osrmInstructions) {
      navInfo = osrmInstructions;
    } else {
      navInfo = {
        main: "Rota hesaplanıyor...",
        sub: `Mesafe: ${(selectedShelter.distance * 1000).toFixed(0)}m`,
        icon: <ArrowRightCircle size={24} color="#FFF" />
      };
    }
  }

  const geoJsonData = useMemo(() => {
    return mapType === 'school' ? tepekentGeoJSON : sefakoyGeoJSON;
  }, [mapType]);

  const pathFinder = useMemo(() => {
    try {
      return new PathFinder(geoJsonData);
    } catch(err) {
      console.log('PathFinder err', err);
      return null;
    }
  }, [geoJsonData]);

  useEffect(() => {
    if (userLocation && selectedShelter && pathFinder) {
      setOsrmInstructions(null);
      try {
        const startNode = findNearestGraphNode(userLocation.latitude, userLocation.longitude, geoJsonData);
        const endNode = findNearestGraphNode(selectedShelter.lat, selectedShelter.lng, geoJsonData);
        
        if (startNode && endNode) {
          const path = pathFinder.findPath(point(startNode), point(endNode));
          if (path && path.path) {
            const coords = path.path.map((p: any) => ({ latitude: p[1], longitude: p[0] }));
            setOsrmRoute(coords);
            
            const totalDistKm = path.weight; 
            const totalDistMeters = Math.round(totalDistKm * 1000);
            const instText = generateOfflineInstructions(coords);
            
            setOsrmInstructions({
              main: instText,
              sub: `Mesafe: ${totalDistMeters}m (${totalDistKm.toFixed(2)} km)`,
              icon: <ArrowRightCircle size={24} color="#FFF" />
            });
            return;
          }
        }
      } catch (err) {
        console.log('Offline Routing fallback', err);
      }
      
      // fallback düz çizgi
      setOsrmRoute([
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: selectedShelter.lat, longitude: selectedShelter.lng }
      ]);
    } else {
      setOsrmRoute([]);
    }
  }, [userLocation, selectedShelter, pathFinder, geoJsonData]);

  const betterAvailable = isBetterShelterAvailable();
  const alertRed = '#FF5252';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header Background (Glow Efektli) */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
      </View>

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}><ChevronLeft size={28} color="#FFF" /></TouchableOpacity>
        <Text style={styles.title}>{mapType === 'school' ? 'OKUL HARİTASI' : 'İNTERNETSİZ HARİTA'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mapWrapper, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialCamera={{ center: mapCenter, pitch: 90, zoom: 15, heading: 0 }}
            mapType="standard"
            minZoomLevel={14}
            maxZoomLevel={18}
            showsUserLocation={false}
            showsCompass={false}
            showsPointsOfInterest={false}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
            toolbarEnabled={false}
            loadingEnabled={true}
            pitchEnabled={true}
          >
            <LocalTile 
              pathTemplate="file:///android_asset/tiless/{z}/{x}/{y}.png" 
              tileSize={256} 
              zIndex={999} 
            />
            {userLocation && <Marker coordinate={userLocation} title="Siz" pinColor="blue" zIndex={1000} />}
            {userLocation && selectedShelter && osrmRoute.length > 0 && (
              <>
                <Polyline coordinates={osrmRoute} strokeColor="rgba(30, 58, 138, 0.4)" strokeWidth={16} zIndex={10} lineCap="round" lineJoin="round" />
                <Polyline coordinates={osrmRoute} strokeColor="#3B82F6" strokeWidth={8} zIndex={11} lineCap="round" lineJoin="round" />
                <Polyline coordinates={osrmRoute} strokeColor="rgba(255, 255, 255, 0.3)" strokeWidth={2} zIndex={12} lineCap="round" lineJoin="round" />
              </>
            )}
            {allShelters.map(s => {
              const isTop5 = top5Ids.includes(s.id);
              return (
                <Marker 
                  key={`${s.id}-${isTop5 ? 'green' : 'red'}`} 
                  coordinate={{ latitude: s.lat, longitude: s.lng }} 
                  title={s.name} 
                  pinColor={isTop5 ? 'green' : 'red'}
                  onPress={() => handleSelectShelter(s)} 
                />
              );
            })}
          </MapView>
          <TouchableOpacity style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={resetView}>
            <RefreshCcw size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Harita İşaretçileri Göstergesi (Map Legend) */}
        <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Siz</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>{mapType === 'school' ? 'En Yakın 5 Okul' : 'En Yakın 5 Sığınak'}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>{mapType === 'school' ? 'Diğer Okullar' : 'Diğer Sığınaklar'}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: betterAvailable ? alertRed : colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: betterAvailable ? 'rgba(255, 82, 82, 0.1)' : 'rgba(30, 58, 138, 0.1)' }]}>
            {betterAvailable ? <AlertTriangle size={24} color={alertRed} /> : <Navigation size={24} color={colors.primary} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: betterAvailable ? alertRed : colors.text }]}>
              {betterAvailable 
                ? (mapType === 'school' ? 'Daha Yakın Bir Okul Var!' : 'Daha Yakın Bir Sığınak Var!') 
                : (selectedShelter ? selectedShelter.name : (mapType === 'school' ? 'Okul Seçin' : 'Sığınak Seçin'))
              }
            </Text>
            <Text style={[styles.infoSub, { color: colors.textSecondary }]}>
              {betterAvailable 
                ? (mapType === 'school' ? 'Listeden en yakın okulu seçebilirsiniz.' : 'Listeden en yakın sığınağı seçebilirsiniz.') 
                : 'En güvenli ve yakın rotayı takip edin.'
              }
            </Text>
          </View>
        </View>

        {selectedShelter && userLocation && navInfo && (
          <View style={[styles.navCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={[styles.navIcon, { backgroundColor: colors.primary }]}>{navInfo.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navMainText}>
                {renderStyledText(navInfo.main)}
              </Text>
              <Text style={[styles.navSub, { color: colors.textSecondary }]}>{navInfo.sub}</Text>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {top5Shelters.map((s) => (
              <TouchableOpacity key={s.id} style={[styles.shelterCard, { backgroundColor: colors.surface, borderColor: selectedShelter?.id === s.id ? colors.primary : colors.border }]} onPress={() => handleSelectShelter(s)}>
                <LucideMap size={18} color={selectedShelter?.id === s.id ? colors.primary : colors.textSecondary} />
                <Text style={[styles.shelterName, { color: colors.text }]}>{s.name}</Text>
                <Text style={[styles.shelterDist, { color: colors.primary }]}>{(s.distance || 0).toFixed(2)} km</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.35, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 20, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  title: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, alignItems: 'center' },
  mapWrapper: { width: width - 40, height: width - 40, borderRadius: 24, overflow: 'hidden', borderWidth: 3, elevation: 5, marginBottom: 10 },
  map: { flex: 1, marginBottom: Platform.OS === 'android' ? -35 : 0, marginTop: Platform.OS === 'android' ? -10 : 0 },
  resetBtn: { position: 'absolute', top: 15, right: 15, width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)' },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1.5,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    elevation: 1,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, width: '100%', marginBottom: 10, borderWidth: 2, elevation: 3 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoTitle: { fontSize: 14, fontWeight: '800' },
  infoSub: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  navCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 2, width: '100%', marginBottom: 10, elevation: 3 },
  navIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  navMainText: { fontSize: 14, fontWeight: '600', lineHeight: 22 },
  highlightText: { fontWeight: '900' },
  navSub: { fontSize: 10, fontWeight: '900', marginTop: 8, letterSpacing: 0.5 },
  listContainer: { width: '100%', marginTop: 5, paddingBottom: 10 },
  scrollContentList: { paddingRight: 20 },
  shelterCard: { padding: 10, borderRadius: 12, borderWidth: 2, marginRight: 10, alignItems: 'center', minWidth: 100 },
  shelterName: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  shelterDist: { fontSize: 9, fontWeight: '800', marginTop: 1 }
});
