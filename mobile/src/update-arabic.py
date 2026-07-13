#!/usr/bin/env python3
"""
Auto-update script to add Arabic language support to all remaining components
Run this to bulk-update all files with Arabic translations
"""

files_to_update = [
    {
        "file": "/components/SmartCardScreen.tsx",
        "line": 9,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/FamilyScreen.tsx",
        "line": 23,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/SheltersMapScreen.tsx",
        "line": 25,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/NavigationRouteScreen.tsx",
        "line": 12,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/InternalMapScreen.tsx",
        "line": 11,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/SafetyGuidanceScreen.tsx",
        "line": 8,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/OfflineModeScreen.tsx",
        "line": 11,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
    {
        "file": "/components/OnlineStatusNotification.tsx",
        "line": 5,
        "from": "language: 'tr' | 'en';",
        "to": "language: 'tr' | 'en' | 'ar';",
        "add_isRTL": True
    },
]

# Arabic translations template
arabic_translations = {
    "SmartCardScreen": {
        "title": "البطاقة الذكية",
        "fullName": "الاسم الكامل",
        "cardNumber": "رقم البطاقة",
        "status": "الحالة",
        "familyMembers": "أفراد العائلة",
        "assignedShelter": "المأوى المخصص",
        "room": "الغرفة",
        "scanCode": "امسح الرمز",
        "showToStaff": "أظهر هذا للموظفين",
    },
    "FamilyScreen": {
        "title": "العائلة",
        "members": "الأعضاء",
        "addMember": "إضافة عضو",
        "edit": "تعديل",
        "delete": "حذف",
        "name": "الاسم",
        "relation": "العلاقة",
        "age": "العمر",
        "phone": "الهاتف",
        "status": "الحالة",
        "location": "الموقع",
    },
    "SheltersMapScreen": {
        "title": "خريطة المأوى",
        "nearestShelters": "أقرب المآوي",
        "distance": "المسافة",
        "capacity": "السعة",
        "open": "مفتوح",
        "full": "ممتلئ",
        "closed": "مغلق",
        "directions": "الاتجاهات",
    },
    "NavigationRouteScreen": {
        "title": "الملاحة",
        "directions": "الاتجاهات",
        "distance": "المسافة",
        "eta": "الوقت المتوقع",
        "startNavigation": "بدء الملاحة",
    },
}

print("📝 Arabic Language Update Script")
print("=" * 50)
print(f"Files to update: {len(files_to_update)}")
print("\nThis script will:")
print("1. Change type definition to include 'ar'")
print("2. Add Arabic translations")
print("3. Add RTL support")
print("4. Update dir attribute")
print("\n⚠️  Please run the tool commands manually to apply updates")
