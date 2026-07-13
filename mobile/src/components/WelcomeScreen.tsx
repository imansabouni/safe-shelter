import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield as LucideShield, Globe as LucideGlobe } from 'lucide-react-native';

const Shield = LucideShield as any;
const Globe = LucideGlobe as any;

const { height, width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  language?: 'tr' | 'en' | 'ar';
  onLanguageChange?: (lang: 'tr' | 'en' | 'ar') => void;
}

export default function WelcomeScreen({
  navigation,
  language = 'tr',
  onLanguageChange = () => {}
}: WelcomeScreenProps) {
  const content = {
    tr: { appName: 'Shelter Smart', tagline: 'Güvenliğiniz Önceliğimiz', description: 'Afet ve acil durumlarda size ve ailenize yardımcı olmak için tasarlandı', login: 'Giriş Yap', register: 'Hesap Oluştur', guest: 'Misafir Olarak Devam Et', features: ['🗺️ Gerçek zamanlı sığınak haritası', '👨‍👩‍👧 Aile takip sistemi', '🆘 Anında SOS yardım', '📱 Dijital akıllı kart'] },
    en: { appName: 'Shelter Smart', tagline: 'Your Safety is Our Priority', description: 'Designed to help you and your family during disasters and emergencies', login: 'Login', register: 'Create Account', guest: 'Continue as Guest', features: ['🗺️ Real-time shelter map', '👨‍👩‍👧 Family tracking system', '🆘 Instant SOS help', '📱 Digital smart card'] },
    ar: { appName: 'شيلتر سمارت', tagline: 'سلامتك أولويتنا', description: 'مصمم لمساعدتك أنت وعائلتك خلال الكوارث وحالات الطوارئ', login: 'تسجيل الدخول', register: 'إنشاء حساب', guest: 'متابعة كضيف', features: ['🗺️ خريطة الملاجئ الحية', '👨‍👩‍👧 نظام تتبع العائلة', '🆘 مساعدة SOS فورية', '📱 البطاقة الذكية الرقمية'] }
  };

  const t = content[language] || content.tr;
  const isRTL = language === 'ar';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background} />
      
      {/* Language Selector */}
      <View style={[styles.langContainer, isRTL ? { left: 24 } : { right: 24 }]}>
        <View style={styles.langSwitch}>
          {(['tr', 'en', 'ar'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => onLanguageChange(lang)}
              style={[styles.langBtn, language === lang && styles.langBtnActive]}
            >
              <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, styles.shadow]}>
            <Shield size={60} color="#FFF" />
          </View>
          <Text style={styles.appName}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <View style={[styles.featuresCard, styles.shadow]}>
            {t.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.description}>{t.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.primaryBtn, styles.shadow]} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>{t.login}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => navigation.navigate('Registration')}
          >
            <Text style={styles.secondaryBtnText}>{t.register}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestBtn} 
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.guestBtnText}>{t.guest} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2563EB' },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: width * 0.4,
    borderBottomRightRadius: width * 0.4,
    transform: [{ scaleX: 1.5 }],
  },
  langContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, zIndex: 10 },
  langSwitch: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 20 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  langBtnActive: { backgroundColor: '#FFF' },
  langBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  langBtnTextActive: { color: '#2563EB' },
  content: { flex: 1, justifyContent: 'space-between', padding: 32, paddingTop: 100 },
  logoSection: { alignItems: 'center' },
  logoBox: { width: 100, height: 100, backgroundColor: '#2563EB', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 4, borderColor: '#FFF' },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  tagline: { fontSize: 18, color: '#DBEAFE', fontWeight: '500' },
  featuresSection: { alignItems: 'center' },
  featuresCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, width: '100%', marginBottom: 24 },
  featureItem: { paddingVertical: 8 },
  featureText: { fontSize: 15, color: '#1E40AF', fontWeight: '600' },
  description: { textAlign: 'center', color: '#DBEAFE', fontSize: 14, lineHeight: 22 },
  actionSection: { gap: 12 },
  primaryBtn: { backgroundColor: '#FFF', height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#2563EB', fontSize: 18, fontWeight: '800' },
  secondaryBtn: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  secondaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  guestBtn: { alignItems: 'center', padding: 12 },
  guestBtnText: { color: '#DBEAFE', fontSize: 14, fontWeight: '600' },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 8 }
    })
  }
});
