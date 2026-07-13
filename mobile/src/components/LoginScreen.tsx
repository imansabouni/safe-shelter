import { useRouter } from 'expo-router';
import { ArrowRight, Hash, User, UserCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [fullName, setFullName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    if (!fullName || !familyCode) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/login-family-member', {
        name: fullName.trim(),
        family_code: familyCode.trim().toUpperCase(),
      });
      if (response.data?.success) {
        console.log("BACKENDDEN GELEN HAM VERİ (DEBUG):", response.data);
        const member = response.data.member;
        const card = response.data.card;
        login({
          id: member.id,
          card_id: card.id,
          card_member_id: member.id,
          fullName: member.name,
          userId: member.user_code || 'USER',
          user_code: member.user_code,
          family_code: card.family_code,
          familyMembers: 1,
          status: member.status || 'outside',
          phoneNumber: member.phone || 'Yok',
        });
        router.replace({
          pathname: '/(tabs)',
          params: {
            card_id: String(card.id),
            member_id: String(member.id),
            family_code: card.family_code,
            role: member.role || 'member',
          },
        });
      } else {
        alert('Hatalı bilgiler. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Giriş başarısız. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login({ id: 0, fullName: 'Misafir Kullanıcı', userId: 'GUEST', familyMembers: 1, status: 'outside-shelter', phoneNumber: 'N/A' });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Background with Glow */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 250, height: 250 }]} />
        <View style={[styles.headerGlow, { bottom: 50, right: -40, width: 200, height: 200 }]} />

        <View style={styles.headerContent}>
          <Text style={styles.title}>Giriş Yap</Text>
          <Text style={styles.subtitle}>Safe Shelter • Güvenli Sığınak Sistemi</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>İSİM SOYİSİM</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.primary }]}
                  placeholder="Eksiksiz adınızı girin"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={[styles.label, { marginTop: 24 }]}>AİLE NUMARASI / KOD</Text>
              <View style={styles.inputWrapper}>
                <Hash size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.primary }]}
                  placeholder="Örn: FAM001"
                  placeholderTextColor="#94A3B8"
                  value={familyCode}
                  onChangeText={setFamilyCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={styles.buttonText}>DEVAM ET</Text>
                  <ArrowRight size={22} color="#FFF" style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
              <UserCircle size={18} color="#64748B" />
              <Text style={styles.guestButtonText}>Misafir Olarak Giriş Yap</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Kayıt Olun</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  bgHeader: {
    height: height * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden'
  },
  headerGlow: { position: 'absolute', borderRadius: 150, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  headerContent: { alignItems: 'center', zIndex: 10 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10
  },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#93C5FD', marginTop: 6, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 24, marginTop: 40, paddingBottom: 50 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 30,
    paddingTop: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  label: { fontSize: 11, fontWeight: '900', color: '#64748B', marginBottom: 10, marginLeft: 6, letterSpacing: 1 },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  loginButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    paddingVertical: 5
  },
  guestButtonText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  inputGroup: { marginTop: 5 },
  registerLink: { fontSize: 15, fontWeight: '900', textDecorationLine: 'underline' }
});
