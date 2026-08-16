export type Language = "en" | "ar";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.courses": "Courses",
    "nav.certificates": "Certificates",
    "nav.messages": "Messages",
    "nav.profile": "Profile",
    "nav.signOut": "Sign out",
    "dashboard.title": "My Learning",
    "dashboard.subtitle": "Resume your courses and keep every next step clear.",
    "course.resume": "Resume course",
    "course.start": "Start learning",
    "course.enroll": "Enroll",
    "course.locked": "Complete the previous lesson to unlock this one.",
    "lesson.complete": "Mark complete",
  },
  ar: {
    "nav.dashboard": "تعلمي",
    "nav.courses": "الدورات",
    "nav.certificates": "الشهادات",
    "nav.messages": "الرسائل",
    "nav.profile": "الملف الشخصي",
    "nav.signOut": "تسجيل الخروج",
    "dashboard.title": "تعلمي",
    "dashboard.subtitle": "استكملي دوراتك بخطوة واضحة في كل مرة.",
    "course.resume": "استكمال الدورة",
    "course.start": "ابدأ التعلم",
    "course.enroll": "التحق بالدورة",
    "course.locked": "أكمل الدرس السابق لفتح هذا الدرس.",
    "lesson.complete": "تحديد كمكتمل",
  },
};

export function normalizeLanguage(language?: string | null): Language {
  return language === "ar" ? "ar" : "en";
}

export function t(key: string, language?: string | null): string {
  const lang = normalizeLanguage(language);
  return translations[lang][key] ?? translations.en[key] ?? key;
}
