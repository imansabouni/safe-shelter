// Central translation file for Shelter Smart App
// Supports: Turkish (TR), English (EN), Arabic (AR)

export const translations = {
  // Common
  common: {
    tr: {
      back: 'Geri',
      next: 'İleri',
      cancel: 'İptal',
      confirm: 'Onayla',
      save: 'Kaydet',
      delete: 'Sil',
      edit: 'Düzenle',
      close: 'Kapat',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi'
    },
    en: {
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
    },
    ar: {
      back: 'رجوع',
      next: 'التالي',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      warning: 'تحذير',
      info: 'معلومة'
    }
  },

  // Status
  status: {
    tr: {
      open: 'Açık',
      closed: 'Kapalı',
      full: 'Dolu',
      available: 'Mevcut',
      insideShelter: 'Sığınaktayım',
      outsideShelter: 'Sığınak Dışındayım',
      enRoute: 'Yoldayım'
    },
    en: {
      open: 'Open',
      closed: 'Closed',
      full: 'Full',
      available: 'Available',
      insideShelter: 'Inside Shelter',
      outsideShelter: 'Outside Shelter',
      enRoute: 'En Route'
    },
    ar: {
      open: 'مفتوح',
      closed: 'مغلق',
      full: 'ممتلئ',
      available: 'متاح',
      insideShelter: 'داخل المأوى',
      outsideShelter: 'خارج المأوى',
      enRoute: 'في الطريق'
    }
  },

  // Family Relations
  familyRelations: {
    tr: {
      father: 'Baba',
      mother: 'Anne',
      son: 'Oğul',
      daughter: 'Kız',
      spouse: 'Eş',
      brother: 'Kardeş (Erkek)',
      sister: 'Kardeş (Kız)',
      grandfather: 'Dede',
      grandmother: 'Büyükanne',
      other: 'Diğer'
    },
    en: {
      father: 'Father',
      mother: 'Mother',
      son: 'Son',
      daughter: 'Daughter',
      spouse: 'Spouse',
      brother: 'Brother',
      sister: 'Sister',
      grandfather: 'Grandfather',
      grandmother: 'Grandmother',
      other: 'Other'
    },
    ar: {
      father: 'أب',
      mother: 'أم',
      son: 'ابن',
      daughter: 'ابنة',
      spouse: 'زوج/زوجة',
      brother: 'أخ',
      sister: 'أخت',
      grandfather: 'جد',
      grandmother: 'جدة',
      other: 'آخر'
    }
  },

  // Emergency Types
  emergencyTypes: {
    tr: {
      medical: 'Tıbbi Acil Durum',
      injured: 'Yaralı',
      trapped: 'Mahsur Kaldı',
      fire: 'Yangın',
      water: 'Su Yok',
      food: 'Yiyecek Yok',
      shelter: 'Sığınak Gerekli',
      transport: 'Taşıma Gerekli',
      other: 'Diğer'
    },
    en: {
      medical: 'Medical Emergency',
      injured: 'Injured',
      trapped: 'Trapped',
      fire: 'Fire',
      water: 'No Water',
      food: 'No Food',
      shelter: 'Shelter Needed',
      transport: 'Transport Needed',
      other: 'Other'
    },
    ar: {
      medical: 'طوارئ طبية',
      injured: 'مصاب',
      trapped: 'محاصر',
      fire: 'حريق',
      water: 'لا يوجد ماء',
      food: 'لا يوجد طعام',
      shelter: 'بحاجة لمأوى',
      transport: 'بحاجة لنقل',
      other: 'أخرى'
    }
  }
};

export function getTranslation(section: keyof typeof translations, key: string, language: 'tr' | 'en' | 'ar'): string {
  const sectionData = translations[section];
  if (!sectionData || !sectionData[language]) {
    return key;
  }
  return (sectionData[language] as any)[key] || key;
}
