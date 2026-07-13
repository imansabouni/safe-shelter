import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users as LucideUsers, 
  Search as LucideSearch, 
  Plus as LucidePlus, 
  MapPin as LucideMapPin, 
  ChevronLeft as LucideChevronLeft,
  User as LucideUser,
  Clock as LucideClock,
  Share2 as LucideShare2,
  Activity as LucideActivity,
  Zap
} from 'lucide-react-native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateDistance, formatDistanceDisplay } from '../utils/geoUtils';

const { width, height } = Dimensions.get('window');

const ChevronLeft = LucideChevronLeft as any;
const UserIcon = LucideUser as any;
const SearchIcon = LucideSearch as any;
const PlusIcon = LucidePlus as any;

export default function FriendsScreen({ navigation, language = 'tr', userData }: any) {
  const { colors, isDark } = useTheme();
  const [friendId, setFriendId] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState<any>(null);

  const translations: any = {
    tr: { title: 'Bağlantılar', myCode: 'KODUNUZ', share: 'Konum Paylaş', addPlaceholder: 'Arkadaş kodu gir...', friendsTitle: 'ARKADAŞLARIM', empty: 'Henüz bağlantı yok.' },
    en: { title: 'Connections', myCode: 'YOUR CODE', share: 'Share Location', addPlaceholder: 'Enter friend code...', friendsTitle: 'MY FRIENDS', empty: 'No connections yet.' }
  };
  const t = translations[language] || translations.tr;

  useEffect(() => {
    loadFriends();
    getUserLocation();
  }, [userData?.user_code]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.log('FriendsScreen: Location services are disabled.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setMyLocation(loc.coords);
      }
    } catch (e) {
      console.log('FriendsScreen location fetch error (silenced):', e);
    }
  };

  const loadFriends = async () => {
    if (!userData?.user_code) return;
    try {
      const res = await api.get(`/friends/${userData.user_code}`);
      setFriends(res.data.friends || res.data || []);
    } catch (e) {}
  };

  const handleAddFriend = async () => {
    if (!friendId.trim()) return;
    setLoading(true);
    try {
      await api.post('/friends/add', { my_code: userData.user_code, friend_code: friendId.trim() });
      Alert.alert("Başarılı", "Arkadaş eklendi");
      setFriendId('');
      loadFriends();
    } catch (err: any) {
      Alert.alert("Hata", err?.response?.data?.message || "İşlem başarısız.");
    } finally { setLoading(false); }
  };

  const shareLocation = async () => {
    if (!myLocation || !userData?.user_code) {
      Alert.alert("Hata", "Konum bilgisi alınamadı. Lütfen GPS'i kontrol edin.");
      return;
    }
    
    setIsSharing(true);
    try {
      const res = await api.post('/location/update', {
        user_code: userData.user_code,
        lat: myLocation.latitude,
        lng: myLocation.longitude
      });
      if (res.data.success) {
        Alert.alert("Başarılı", "Konumunuz arkadaşlarınızla paylaşıldı.");
      }
    } catch (e) {
      Alert.alert("Hata", "Konum paylaşılırken bir sorun oluştu.");
      setIsSharing(false);
    }
  };

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

        <View style={styles.myCodeCard}>
          <View style={styles.myCodeInfo}>
            <Text style={styles.myCodeLabel}>{t.myCode}</Text>
            <Text style={styles.myCodeValue}>{userData?.user_code || '---'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.shareBtn, isSharing ? { backgroundColor: '#10B981' } : { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={shareLocation}
          >
            <LucideShare2 size={18} color="#FFF" />
            <Text style={styles.shareBtnText}>{isSharing ? 'AÇIK' : t.share}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <SearchIcon size={20} color="#94A3B8" />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]} 
            placeholder={t.addPlaceholder} 
            placeholderTextColor="#94A3B8"
            value={friendId}
            onChangeText={setFriendId}
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddFriend} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <PlusIcon size={22} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.friendsTitle} ({friends.length})</Text>
        
        {friends.length === 0 ? (
          <View style={styles.emptyBox}>
            <LucideUsers size={48} color={isDark ? colors.border : '#E2E8F0'} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.empty}</Text>
          </View>
        ) : (
          friends.map(friend => {
            let dist = null;
            let isNearby = false;

            if (myLocation && friend.lat && friend.lng) {
              dist = calculateDistance(myLocation.latitude, myLocation.longitude, parseFloat(friend.lat), parseFloat(friend.lng));
              isNearby = dist < 0.5; // 500 metreden yakınsa
            }

            return (
            <TouchableOpacity 
              key={friend.id} 
              style={[styles.friendCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#F1F5F9' }]}
              onPress={() => navigation.navigate('Navigation', { 
                shelter: { id: friend.id, name: friend.name, lat: friend.lat, lng: friend.lng, type: 'friend' }
              })}
            >
              <View style={styles.avatarBox}>
                <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]}>
                  <UserIcon size={28} color={colors.primary} />
                </View>
                <View style={[styles.statusDot, { backgroundColor: friend.status === 'inside' ? '#10B981' : '#64748B' }]} />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>{friend.name}</Text>
                </View>
                <View style={[styles.friendMeta, { marginTop: 2 }]}>
                  <LucideMapPin size={12} color={colors.textSecondary} />
                  <Text style={[styles.friendStatus, { color: colors.textSecondary }]}>
                    {friend.status === 'inside' ? 'Sığınakta' : 'Dışarıda'}
                  </Text>
                  {isNearby && (
                    <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>Yakında</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.distBox}>
                <LucideActivity size={12} color={colors.primary} />
                <Text style={[styles.distText, { color: colors.primary }]}>Takip Et</Text>
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.36, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 35 : 45, marginBottom: 55 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  myCodeCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  myCodeInfo: {},
  myCodeLabel: { fontSize: 10, fontWeight: '800', color: '#93C5FD', marginBottom: 4 },
  myCodeValue: { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  shareBtn: { height: 44, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  shareBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  searchContainer: { paddingHorizontal: 24, marginTop: -65 },
  searchBar: { height: 64, borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 6, borderWidth: 1.5, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '700' },
  addBtn: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 35, paddingBottom: 50 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },
  friendCard: { height: 84, borderRadius: 24, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12, borderWidth: 1.5, elevation: 3 },
  avatarBox: { width: 56, height: 56 },
  avatar: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusDot: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#FFF' },
  friendName: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  friendStatus: { fontSize: 12, fontWeight: '700' },
  distBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(30,58,138,0.05)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  distText: { fontSize: 11, fontWeight: '900' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 15 },
  emptyText: { fontSize: 15, fontWeight: '700' }
});
