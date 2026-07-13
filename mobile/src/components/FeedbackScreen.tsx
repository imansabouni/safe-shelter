import {
  CheckCircle2 as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft,
  MessageSquare as LucideMessageSquare,
  Send as LucideSend,
  Star as LucideStar
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Alert,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { UserData } from '../types/user';
const { width, height } = Dimensions.get('window');

const ChevronLeft = LucideChevronLeft as any;
const Star = LucideStar as any;
const Send = LucideSend as any;
const MessageSquare = LucideMessageSquare as any;
const CheckCircle = LucideCheckCircle as any;

interface FeedbackScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void; };
  language?: 'tr' | 'en' | 'ar';
  userData?: UserData;
}

export default function FeedbackScreen({ navigation, language = 'tr', userData }: FeedbackScreenProps) {
  const { colors, isDark } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get('/comments');
      console.log('Comments API Response:', response.data);

      // Handle various response formats: response.data.data, response.data.comments, or response.data as array
      const data = response.data?.data || response.data?.comments || (Array.isArray(response.data) ? response.data : []);

      setCommentsList(data);
    } catch (error) {
      console.log('Fetch Comments Error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const t = {
    tr: {
      title: 'Uygulamayı Puanla',
      subtitle: 'Bizi puanlamak ister misiniz?',
      ratingLabel: 'Hizmetimizi puanlayın',
      commentLabel: 'Yorumlarınız veya önerileriniz',
      placeholder: 'Buraya yazabilirsiniz...',
      submit: 'Gönder',
      successTitle: 'Teşekkürler!',
      successMessage: 'Puanınız başarıyla kaydedildi.',
      goHome: 'Ana Sayfaya Dön',
      ratingRequired: 'Lütfen bir puan seçin.',
      commentRequired: 'Lütfen bir yorum yazın.',
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    },
    en: {
      title: 'Rate App',
      subtitle: 'Would you like to rate us?',
      ratingLabel: 'Rate our service',
      commentLabel: 'Your comments or suggestions',
      placeholder: 'Type here...',
      submit: 'Submit',
      successTitle: 'Thank You!',
      successMessage: 'Your rating has been saved.',
      goHome: 'Back to Home',
      ratingRequired: 'Please select a rating.',
      commentRequired: 'Please write a comment.',
      error: 'An error occurred. Please try again.'
    },
    ar: {
      title: 'تقييم التطبيق',
      subtitle: 'هل تود تقييمنا؟',
      ratingLabel: 'قيم خدمتنا',
      commentLabel: 'تعليقاتك أو اقتراحاتك',
      placeholder: 'اكتب هنا...',
      submit: 'إرسال',
      successTitle: 'شكرًا لك!',
      successMessage: 'تم حفظ تقييمك بنجاح.',
      goHome: 'العودة للرئسية',
      ratingRequired: 'يرجى اختيار التقييم.',
      commentRequired: 'يرجى كتابة تعليق.',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
    }
  }[language] || { title: 'Uygulamayı Puanla', subtitle: 'Bize yazın', ratingLabel: 'Puanlayın', commentLabel: 'Yorumunuz', placeholder: 'Yazın...', submit: 'Gönder', successTitle: 'Teşekkürler', successMessage: 'Alındı', goHome: 'Geri Dön', ratingRequired: 'Puan seçin', commentRequired: 'Yorum yazın' };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('', t.ratingRequired);
      return;
    }
    if (!comment.trim()) {
      Alert.alert('', t.commentRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/comments', {
        rating: rating,
        comment: comment,
        name: userData?.fullName || 'Anonim',
        card_id: userData?.card_id || userData?.id,
        shelter_id: 1 // Default shelter id
      });

      if (response.data.success) {
        setIsSubmitted(true);
        fetchComments(); // Refresh list
      } else {
        Alert.alert('Hata', response.data.message || t.error);
      }
    } catch (error: any) {
      console.log('Comment Submission Error:', error);
      Alert.alert('Hata', error.response?.data?.message || t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5' }]}>
            <CheckCircle size={80} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: isDark ? colors.text : '#065F46' }]}>{t.successTitle}</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>{t.successMessage}</Text>
          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: '#10B981' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeBtnText}>{t.goHome}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
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

          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, styles.shadow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }]}>
              <MessageSquare size={30} color={colors.primary} />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.primary }]}>{t.ratingLabel}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starWrapper}
                >
                  <Star
                    size={40}
                    fill={rating >= star ? "#F59E0B" : "transparent"}
                    color={rating >= star ? "#F59E0B" : (isDark ? colors.border : "#D1D5DB")}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionLabel, { color: colors.primary }]}>{t.commentLabel}</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: isDark ? colors.background : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              placeholder={t.placeholder}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                (isSubmitting || rating === 0 || !comment.trim()) && styles.submitBtnDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Send size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? '...' : t.submit}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments List Section */}
          <View style={{ marginTop: 40, paddingBottom: 60 }}>
            <Text style={[styles.sectionLabel, { color: colors.primary, marginBottom: 20 }]}>
              {language === 'tr' ? 'Topluluk Yorumları' : (language === 'ar' ? 'تعليقات المجتمع' : 'Community Comments')}
            </Text>

            {loadingComments ? (
              <Text style={{ textAlign: 'center', color: colors.textSecondary }}>Yükleniyor...</Text>
            ) : commentsList.length > 0 ? (
              commentsList.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentName, { color: colors.text }]}>{item.name || 'Misafir'}</Text>
                    <View style={styles.commentStars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={12}
                          fill={item.rating >= s ? "#F59E0B" : "transparent"}
                          color={item.rating >= s ? "#F59E0B" : colors.border}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.comment}</Text>
                  <Text style={styles.commentDate}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, fontStyle: 'italic' }}>
                Henüz yorum yapılmamış.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgHeader: { height: height * 0.26, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden', paddingHorizontal: 24 },
  headerGlow: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 70, marginBottom: 5 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: '#BFDBFE', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  content: { padding: 24, paddingTop: 30 },
  card: { borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  sectionLabel: { fontSize: 14, fontWeight: '800', marginBottom: 15, alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: 0.5 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  starWrapper: { padding: 2 },
  divider: { width: '100%', height: 1, marginVertical: 20 },
  textArea: { width: '100%', minHeight: 120, borderRadius: 22, padding: 16, fontSize: 15, borderWidth: 1, marginBottom: 20, fontWeight: '600' },
  submitBtn: { width: '100%', height: 66, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, ...Platform.select({ ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 }, android: { elevation: 8 } }) },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIconBox: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  successTitle: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
  successMessage: { fontSize: 18, textAlign: 'center', marginBottom: 40, fontWeight: '600' },
  homeBtn: { paddingHorizontal: 40, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 }, android: { elevation: 6 } }) },
  homeBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 25 },
      android: { elevation: 5 }
    })
  },
  commentCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '800',
  },
  commentStars: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  commentDate: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '700',
  }
});
