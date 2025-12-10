'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.bookNow': 'Book Now',
    
    // Hero Section
    'hero.title': 'Your Journey to Optimal Health Starts Here',
    'hero.subtitle': 'Dr. Noura Ahmed - Clinical Nutrition Specialist',
    'hero.description': 'Transform your life with personalized nutrition plans tailored to your unique needs and goals',
    'hero.cta': 'Book Consultation',
    'hero.learnMore': 'Learn More',
    
    // About Dr. Noura
    'about.title': 'About Dr. Noura Ahmed',
    'about.subtitle': 'Clinical Nutrition Specialist',
    'about.bio': 'Dr. Noura Ahmed is a certified clinical nutrition specialist dedicated to helping individuals achieve optimal health through evidence-based nutrition strategies and personalized care.',
    
    // Credentials
    'credentials.title': 'Qualifications & Credentials',
    'credentials.master': 'Master\'s in Healthy Nutrition - Cairo University',
    'credentials.diploma': 'Diploma in Healthy Nutrition',
    'credentials.bachelor': 'Bachelor in Food Science & Nutrition - Ain Shams University',
    'credentials.certified': 'Leadership Certificate - Helwan Institute',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive Nutrition Solutions',
    'services.weightManagement': 'Weight Management',
    'services.weightManagementDesc': 'Obesity follow-up and post-bariatric surgery care',
    'services.chronicDisease': 'Therapeutic Nutrition',
    'services.chronicDiseaseDesc': 'Clinical nutrition for chronic diseases (Diabetes, Liver, etc.)',
    'services.sportsNutrition': 'Sports Nutrition',
    'services.sportsNutritionDesc': 'Nutrition for athletes and active individuals',
    'services.pediatricNutrition': 'Pediatric & Elderly Nutrition',
    'services.pediatricNutritionDesc': 'Nutrition for children, young athletes, and elderly',
    'services.prenatalNutrition': 'Online Follow-up',
    'services.prenatalNutritionDesc': 'Remote monitoring for obesity, diabetes, and hypertension cases',
    'services.foodAllergies': 'Weight Loss Technology',
    'services.foodAllergiesDesc': 'Advanced weight loss devices and mesotherapy techniques',
    
    // Testimonials
    'testimonials.title': 'What Our Patients Say',
    'testimonials.subtitle': 'Success Stories',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'We\'re Here to Help',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Working Hours',
    'contact.hoursValue': 'Sun - Thu: 9:00 AM - 8:00 PM',
    'contact.social': 'Follow Us',
    
    // Booking Form
    'booking.title': 'Book Your Consultation',
    'booking.name': 'Full Name',
    'booking.phone': 'Phone Number',
    'booking.email': 'Email Address',
    'booking.age': 'Age',
    'booking.gender': 'Gender',
    'booking.male': 'Male',
    'booking.female': 'Female',
    'booking.service': 'Service Type',
    'booking.selectService': 'Select a service',
    'booking.date': 'Preferred Date',
    'booking.time': 'Preferred Time',
    'booking.notes': 'Additional Notes',
    'booking.submit': 'Submit Booking',
    'booking.success': 'Booking request sent successfully!',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.description': 'Clinical Nutrition Specialist dedicated to your health and wellness journey',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'الخدمات',
    'nav.contact': 'اتصل بنا',
    'nav.dashboard': 'لوحة التحكم',
    'nav.bookNow': 'احجز الآن',
    
    // Hero Section
    'hero.title': 'رحلتك نحو الصحة المثالية تبدأ هنا',
    'hero.subtitle': 'د. نورا أحمد - أخصائية التغذية العلاجية',
    'hero.description': 'حوّل حياتك مع خطط تغذية مخصصة مصممة لتلبية احتياجاتك وأهدافك الفريدة',
    'hero.cta': 'احجز استشارة',
    'hero.learnMore': 'اعرف المزيد',
    
    // About Dr. Noura
    'about.title': 'عن د. نورا أحمد',
    'about.subtitle': 'أخصائية التغذية العلاجية',
    'about.bio': 'د. نورا أحمد أخصائية تغذية علاجية معتمدة مكرسة لمساعدة الأفراد على تحقيق الصحة المثالية من خلال استراتيجيات التغذية المبنية على الأدلة والرعاية الشخصية.',
    
    // Credentials
    'credentials.title': 'المؤهلات والشهادات',
    'credentials.master': 'ماجستير تغذية صحية - جامعة القاهرة',
    'credentials.diploma': 'دبلومة تغذية صحية - نقابة الزراعيين',
    'credentials.bachelor': 'كلية زراعة - علوم وتكنولوجيا الأغذية والتغذية - جامعة عين شمس',
    'credentials.certified': 'شهادة من معهد إعداد القادة بحلوان',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول تغذية شاملة',
    'services.weightManagement': 'متابعة حالات السمنة',
    'services.weightManagementDesc': 'متابعة السمنة وما بعد جراحات السمنة',
    'services.chronicDisease': 'التغذية العلاجية',
    'services.chronicDiseaseDesc': 'تغذية علاجية للأمراض المزمنة (السكر - الكبد...)',
    'services.sportsNutrition': 'التغذية الرياضية',
    'services.sportsNutritionDesc': 'تغذية رياضية للرياضيين والأفراد النشطين',
    'services.pediatricNutrition': 'تغذية الأطفال والمسنين',
    'services.pediatricNutritionDesc': 'تغذية الطفل والطفل الرياضي والمسنين',
    'services.prenatalNutrition': 'المتابعة أونلاين',
    'services.prenatalNutritionDesc': 'متابعة أونلاين لحالات السمنة ومرضى السكر والضغط',
    'services.foodAllergies': 'أجهزة التخسيس',
    'services.foodAllergiesDesc': 'العمل على أجهزة التخسيس وتقنية الميزوثيرابي',
    
    // Testimonials
    'testimonials.title': 'آراء مرضانا',
    'testimonials.subtitle': 'قصص النجاح',
    
    // Contact
    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'نحن هنا للمساعدة',
    'contact.address': 'العنوان',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.hours': 'ساعات العمل',
    'contact.hoursValue': 'الأحد - الخميس: 9:00 صباحاً - 8:00 مساءً',
    'contact.social': 'تابعنا',
    
    // Booking Form
    'booking.title': 'احجز استشارتك',
    'booking.name': 'الاسم الكامل',
    'booking.phone': 'رقم الهاتف',
    'booking.email': 'البريد الإلكتروني',
    'booking.age': 'العمر',
    'booking.gender': 'الجنس',
    'booking.male': 'ذكر',
    'booking.female': 'أنثى',
    'booking.service': 'نوع الخدمة',
    'booking.selectService': 'اختر الخدمة',
    'booking.date': 'التاريخ المفضل',
    'booking.time': 'الوقت المفضل',
    'booking.notes': 'ملاحظات إضافية',
    'booking.submit': 'إرسال الحجز',
    'booking.success': 'تم إرسال طلب الحجز بنجاح!',
    
    // Footer
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.description': 'أخصائية تغذية علاجية ملتزمة برحلتك الصحية والعافية',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang) {
        setLanguage(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}