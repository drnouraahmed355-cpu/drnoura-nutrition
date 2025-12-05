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
    'about.subtitle': 'Your Partner in Health & Wellness',
    'about.bio': 'Dr. Noura Ahmed is a certified clinical nutrition specialist with over 10 years of experience helping individuals achieve their health goals through evidence-based nutrition strategies.',
    
    // Credentials
    'credentials.title': 'Qualifications & Credentials',
    'credentials.phd': 'PhD in Clinical Nutrition',
    'credentials.master': 'Master\'s in Nutritional Sciences',
    'credentials.certified': 'Board Certified Nutrition Specialist',
    'credentials.member': 'Member of International Nutrition Society',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive Nutrition Solutions',
    'services.weightManagement': 'Weight Management',
    'services.weightManagementDesc': 'Personalized weight loss and gain programs',
    'services.chronicDisease': 'Chronic Disease Management',
    'services.chronicDiseaseDesc': 'Specialized nutrition for diabetes, hypertension, and more',
    'services.sportsNutrition': 'Sports Nutrition',
    'services.sportsNutritionDesc': 'Optimize performance with athlete-focused meal plans',
    'services.pediatricNutrition': 'Pediatric Nutrition',
    'services.pediatricNutritionDesc': 'Healthy growth and development for children',
    'services.prenatalNutrition': 'Prenatal & Postnatal Care',
    'services.prenatalNutritionDesc': 'Nutrition support for mothers and babies',
    'services.foodAllergies': 'Food Allergies & Intolerances',
    'services.foodAllergiesDesc': 'Safe and balanced meal planning',
    
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
    'about.subtitle': 'شريكك في الصحة والعافية',
    'about.bio': 'د. نورا أحمد أخصائية تغذية علاجية معتمدة مع أكثر من 10 سنوات من الخبرة في مساعدة الأفراد على تحقيق أهدافهم الصحية من خلال استراتيجيات التغذية المبنية على الأدلة.',
    
    // Credentials
    'credentials.title': 'المؤهلات والشهادات',
    'credentials.phd': 'دكتوراه في التغذية العلاجية',
    'credentials.master': 'ماجستير في علوم التغذية',
    'credentials.certified': 'أخصائية تغذية معتمدة',
    'credentials.member': 'عضو الجمعية الدولية للتغذية',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول تغذية شاملة',
    'services.weightManagement': 'إدارة الوزن',
    'services.weightManagementDesc': 'برامج مخصصة لفقدان واكتساب الوزن',
    'services.chronicDisease': 'إدارة الأمراض المزمنة',
    'services.chronicDiseaseDesc': 'تغذية متخصصة لمرضى السكري وارتفاع ضغط الدم وغيرها',
    'services.sportsNutrition': 'التغذية الرياضية',
    'services.sportsNutritionDesc': 'تحسين الأداء بخطط وجبات مخصصة للرياضيين',
    'services.pediatricNutrition': 'تغذية الأطفال',
    'services.pediatricNutritionDesc': 'نمو وتطور صحي للأطفال',
    'services.prenatalNutrition': 'رعاية ما قبل وبعد الولادة',
    'services.prenatalNutritionDesc': 'دعم تغذوي للأمهات والأطفال',
    'services.foodAllergies': 'الحساسية الغذائية',
    'services.foodAllergiesDesc': 'تخطيط وجبات آمن ومتوازن',
    
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

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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
