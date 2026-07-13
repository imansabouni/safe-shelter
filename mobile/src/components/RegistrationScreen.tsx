import { useRouter } from 'expo-router';
import { ArrowRight, AtSign, PawPrint, Phone, ShieldCheck, User, Users, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function RegistrationScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFamily, setIsFamily] = useState(false);
  const [hasPet, setHasPet] = useState(false);
  const [hasFamilyCode, setHasFamilyCode] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleRegister = async () => {
    if (!fullName || !email || !phoneNumber) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    if (hasFamilyCode && !familyCode) {
      alert('Lütfen aile kodunuzu girin.');
      return;
    }

    setLoading(true);
    try {
      if (hasFamilyCode) {
        const response = await api.post('/join-family', {
          family_code: familyCode.trim(),
          name: fullName,
          email: email.trim().toLowerCase(),
          phone: phoneNumber.trim(),
        });
        if (response.data?.success) {
          alert('Aileye katılım başarılı! Giriş yapabilirsiniz.');
          router.replace({
            pathname: '/login',
            params: { fullName }
          });
        } else {
          alert('Katılım başarısız. Lütfen kodunuzu kontrol edin.');
        }
      } else {
        const response = await api.post('/register-family-owner', {
          name: fullName,
          email: email.trim().toLowerCase(),
          phone: phoneNumber.trim(),
          is_family: isFamily,
          has_pet: hasPet,
        });
        if (response.data?.success) {
          alert('Kayıt başarılı! Giriş kodunuz e-posta adresinize gönderildi.');
          router.replace({
            pathname: '/login',
            params: { fullName }
          });
        } else {
          alert('Kayıt başarısız. Lütfen tekrar deneyin.');
        }
      }
    } catch (error: any) {
      const errors = error?.response?.data?.errors;

      if (errors?.email) {
        alert('Bu e-posta zaten kayıtlı.');
        return;
      }

      alert(error?.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Background with Glow */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 250, height: 250 }]} />
        <View style={[styles.headerGlow, { bottom: 30, right: -40, width: 200, height: 200 }]} />

        <View style={styles.headerContent}>
          <Text style={styles.title}>Yeni Kayıt</Text>
          <Text style={styles.subtitle}>Safe Shelter • Güvenli Yarınlar İçin</Text>
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
                <User size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.primary }]} placeholder="İsim Soyisim" placeholderTextColor="#94A3B8" value={fullName} onChangeText={setFullName} />
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>E-POSTA ADRESİ</Text>
              <View style={styles.inputWrapper}>
                <AtSign size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.primary }]} placeholder="ornek@mail.com" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>TELEFON NUMARASI</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.primary }]} placeholder="5XX XXX XX XX" placeholderTextColor="#94A3B8" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" maxLength={11} />
              </View>
            </View>

            <View style={styles.switchSection}>
              <View style={[styles.switchRow, { borderColor: hasFamilyCode ? colors.primary : '#E2E8F0' }]}>
                <View style={styles.switchLabelGroup}>
                  <View style={[styles.iconBox, { backgroundColor: hasFamilyCode ? 'rgba(30,58,138,0.1)' : '#F1F5F9' }]}>
                    <ShieldCheck size={20} color={hasFamilyCode ? colors.primary : '#64748B'} />
                  </View>
                  <Text style={[styles.switchText, { color: hasFamilyCode ? colors.primary : '#64748B' }]}>Aile Kodum Var</Text>
                </View>
                <Switch value={hasFamilyCode} onValueChange={(val) => { setHasFamilyCode(val); if (val) setIsFamily(false); }} trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }} thumbColor={hasFamilyCode ? colors.primary : '#F4F4F5'} />
              </View>

              {hasFamilyCode && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>AİLE KODU</Text>
                  <View style={styles.inputWrapper}>
                    <Zap size={18} color={colors.primary} style={styles.inputIcon} />
                    <TextInput style={[styles.input, { color: colors.primary }]} placeholder="Örn: FAM1234" placeholderTextColor="#94A3B8" value={familyCode} onChangeText={setFamilyCode} autoCapitalize="characters" />
                  </View>
                </View>
              )}

              {!hasFamilyCode && (
                <>
                  <View style={[styles.switchRow, { borderColor: isFamily ? colors.primary : '#E2E8F0', marginTop: 12 }]}>
                    <View style={styles.switchLabelGroup}>
                      <View style={[styles.iconBox, { backgroundColor: isFamily ? 'rgba(30,58,138,0.1)' : '#F1F5F9' }]}>
                        <Users size={20} color={isFamily ? colors.primary : '#64748B'} />
                      </View>
                      <Text style={[styles.switchText, { color: isFamily ? colors.primary : '#64748B' }]}>Aileniz var mı?</Text>
                    </View>
                    <Switch value={isFamily} onValueChange={setIsFamily} trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }} thumbColor={isFamily ? colors.primary : '#F4F4F5'} />
                  </View>

                  <View style={[styles.switchRow, { borderColor: hasPet ? colors.primary : '#E2E8F0', marginTop: 12 }]}>
                    <View style={styles.switchLabelGroup}>
                      <View style={[styles.iconBox, { backgroundColor: hasPet ? 'rgba(30,58,138,0.1)' : '#F1F5F9' }]}>
                        <PawPrint size={20} color={hasPet ? colors.primary : '#64748B'} />
                      </View>
                      <Text style={[styles.switchText, { color: hasPet ? colors.primary : '#64748B' }]}>Evcil hayvanınız var mı?</Text>
                    </View>
                    <Switch value={hasPet} onValueChange={setHasPet} trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }} thumbColor={hasPet ? colors.primary : '#F4F4F5'} />
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleRegister} disabled={loading} activeOpacity={0.9}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={styles.buttonText}>{hasFamilyCode ? 'AİLEYE KATIL' : 'KAYIT OL'}</Text>
                  <ArrowRight size={20} color="#FFF" style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Giriş Yap</Text>
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
    height: height * 0.25,
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
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10
  },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 12, color: '#93C5FD', marginTop: 4, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 24, marginTop: 15, paddingBottom: 50 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 24,
    paddingTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 8, marginLeft: 6, letterSpacing: 1 },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '700' },
  switchSection: { marginTop: 25, gap: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5
  },
  switchLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  switchText: { fontSize: 14, fontWeight: '800' },
  registerButton: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  footer: { marginTop: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  inputGroup: { marginTop: 5 },
  loginLink: { fontSize: 14, fontWeight: '900', textDecorationLine: 'underline' }
});
