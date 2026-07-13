import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
  action: { label: string; screen: string } | null;
}

export default function AIAssistantScreen({ navigation, language = 'tr' }: any) {
  const { colors, isDark } = useTheme();
  const translations = {
    tr: { title: 'Akıllı Asistan', subtitle: 'Size nasıl yardımcı olabilirim?', placeholder: 'Mesajınızı yazın...', welcome: 'Merhaba! Ben Akıllı Deprem Asistanı. Size nasıl yardımcı olabilirim?', fail: 'Anlayamadım. Lütfen barınak, yardım veya güvenlik gibi anahtar kelimeler kullanarak tekrar sorun.' },
    en: { title: 'AI Assistant', subtitle: 'How can I help you?', placeholder: 'Type your message...', welcome: 'Hello! I am your AI Earthquake Assistant. How can I help you?', fail: "I didn't understand. Please ask again using keywords like shelter, help, or safety." },
    ar: { title: 'المساعد الذكي', subtitle: 'كيف يمكنني مساعدتك؟', placeholder: 'اكتب رسالتك هنا...', welcome: 'مرحباً! أنا مساعد الزلازل الذكي. كيف يمكنني مساعدتك؟', fail: 'لم أفهم طلبك. يرجى المحاولة مرة أخرى باستخدام كلمات مثل مأوى، مساعدة، أو سلامة.' }
  };

  const t = translations[language as keyof typeof translations] || translations.tr;

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: t.welcome, sender: 'ai', action: null }
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    { text: language === 'tr' ? 'Nasıl talep gönderirim?' : 'How to send a request?' },
    { text: language === 'tr' ? 'Barınakları göster' : 'Show shelters' },
    { text: language === 'tr' ? 'QR kodumu aç' : 'Open my QR code' },
    { text: language === 'tr' ? 'Ailemi nasıl bulurum?' : 'Where is my family?' },
    { text: language === 'tr' ? 'Ayarlarımı değiştir' : 'Change my settings' },
    { text: language === 'tr' ? 'Acil numaraları göster' : 'Show emergency numbers' },
    { text: language === 'tr' ? 'Deprem anında ne yapmalı?' : 'What to do during earthquake?' },
    { text: language === 'tr' ? 'Evcil hayvanım (kedim) var' : 'I have a pet (cat/dog)' },
    { text: language === 'tr' ? 'İnternet yokken ne yapacağım?' : 'What if there is no internet?' },
    { text: language === 'tr' ? 'Sağlık merkezi nerede?' : 'Where is the medical center?' },
    { text: language === 'tr' ? 'Panik anında ne yapmalıyım?' : 'What to do in panic?' },
    { text: language === 'tr' ? 'Bağışlar nereye gidiyor?' : 'Where do donations go?' }
  ];

  const processQuery = (query: string) => {
    if (!query.trim()) return;
    const userMsg: Message = { id: Date.now(), text: query, sender: 'user', action: null };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let response = t.fail;
      let action = null;

      const queryLower = query.toLowerCase()
        .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/ı/g, 'i').replace(/ç/g, 'c')
        .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o');

      const checkKeyword = (k: string) => queryLower.includes(k.toLowerCase());

      if (checkKeyword('talep') || checkKeyword('sos') || checkKeyword('yardım')) {
        response = "Yardım taleplerinizi (Ambulans, İtfaiye, Polis) SOS sayfamızdan hızlıca iletebilirsiniz.";
        action = { label: 'SOS Sayfasını Aç', screen: 'SOS' };
      } else if (checkKeyword('aile') || checkKeyword('bulurum')) {
        response = "Aile üyelerinizin durumunu ve konumlarını Aile sayfasından takip edebilirsiniz.";
        action = { label: 'Aile Sayfasını Aç', screen: 'Family' };
      } else if (checkKeyword('ayar') || checkKeyword('degistir')) {
        response = "Bildirim, dil ve profil ayarlarınızı buradan güncelleyebilirsiniz.";
        action = { label: 'Ayarları Aç', screen: 'Settings' };
      } else if (checkKeyword('bagis')) {
        response = "Bağışlarınız doğrudan barınma ve gıda yardımları için kullanılmaktadır.";
        action = { label: 'Bağış Sayfasına Git', screen: 'Donation' };
      } else if (checkKeyword('barinak') || checkKeyword('harita')) {
        response = "En yakın barınakları harita üzerinden görebilirsiniz.";
        action = { label: 'Haritayı Aç', screen: 'SheltersMap' };
      } else if (checkKeyword('qr') || checkKeyword('kod')) {
        response = "QR kodunuzu buradan açabilirsiniz.";
        action = { label: 'QR Tarayıcıyı Aç', screen: 'QRScanner' };
      } else if (checkKeyword('internet') || checkKeyword('offline')) {
        response = "İnternet olmasa bile kritik bilgilere ulaşabilirsiniz.";
        action = { label: 'Çevrimdışı Modu Aç', screen: 'OfflineMode' };
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'ai', action }]);
    }, 800);
    setInputText('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header Pattern */}
      <View style={[styles.bgHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.headerGlow, { top: -60, left: -60, width: 200, height: 200 }]} />
        <View style={[styles.headerGlow, { bottom: -20, right: -40, width: 150, height: 150 }]} />
      </View>

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Sparkles size={22} color="#FFF" />
          <Text style={styles.headerTitle}>{t.title}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={styles.chatArea}>
          {messages.map(msg => (
            <View key={msg.id} style={[
              styles.messageBubble,
              msg.sender === 'ai'
                ? [styles.aiBubble, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]
                : [styles.userBubble, { backgroundColor: colors.primary }]
            ]}>
              <Text style={[
                styles.messageText,
                msg.sender === 'ai'
                  ? [styles.aiText, { color: colors.text }]
                  : [styles.userText, { color: '#FFF' }]
              ]}>{msg.text}</Text>
              {msg.action && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => msg.action && navigation.navigate(msg.action.screen)}
                >
                  <Text style={styles.actionBtnText}>{msg.action.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsList}>
            {quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.suggestionBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F1F5F9', borderColor: colors.border }]}
                onPress={() => processQuery(q.text)}
              >
                <Text style={[styles.suggestionText, { color: colors.primary }]}>{q.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.background : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              placeholder={t.placeholder}
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => processQuery(inputText)}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => processQuery(inputText)}>
              <Send size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { position: 'absolute', top: 0, width: '100%', height: height * 0.3, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 15, zIndex: 100 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  scrollContent: { paddingBottom: 20, paddingTop: 10 },
  subtitle: { fontSize: 13, color: '#93C5FD', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  chatArea: { paddingHorizontal: 24, gap: 16 },
  messageBubble: { padding: 18, borderRadius: 24, maxWidth: '85%', elevation: 2 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderTopLeftRadius: 24 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4, borderTopRightRadius: 24 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  aiText: {},
  userText: {},
  actionBtn: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, marginTop: 15, alignItems: 'center', elevation: 2 },
  actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  inputContainer: { borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingVertical: 20, elevation: 15 },
  suggestionsList: { paddingHorizontal: 24, gap: 10, marginBottom: 15 },
  suggestionBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
  suggestionText: { fontSize: 13, fontWeight: '800' },
  inputRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, alignItems: 'center' },
  input: { flex: 1, borderRadius: 18, paddingHorizontal: 20, height: 56, fontSize: 15, fontWeight: '600', borderWidth: 1.5 },
  sendBtn: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 4 }
});
