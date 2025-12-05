'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Activity, 
  TrendingUp, 
  Baby, 
  Heart, 
  AlertCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function ServicesPage() {
  const { language } = useLanguage();

  const services = [
    {
      icon: Scale,
      title: language === 'ar' ? 'إدارة الوزن' : 'Weight Management',
      description: language === 'ar'
        ? 'برامج مخصصة لفقدان أو اكتساب الوزن بطريقة صحية ومستدامة'
        : 'Customized programs for healthy and sustainable weight loss or gain',
      details: language === 'ar' ? [
        'تقييم شامل للحالة الصحية والتاريخ الطبي',
        'خطة تغذية مخصصة تناسب نمط حياتك',
        'متابعة أسبوعية للوزن والقياسات',
        'نصائح للتعامل مع التحديات والعقبات',
        'تعديل الخطة حسب التقدم والنتائج',
      ] : [
        'Comprehensive health and medical history assessment',
        'Personalized nutrition plan tailored to your lifestyle',
        'Weekly weight and measurements follow-up',
        'Tips for handling challenges and obstacles',
        'Plan adjustment based on progress and results',
      ],
    },
    {
      icon: Activity,
      title: language === 'ar' ? 'إدارة الأمراض المزمنة' : 'Chronic Disease Management',
      description: language === 'ar'
        ? 'تغذية متخصصة لمرضى السكري، ارتفاع ضغط الدم، أمراض القلب، والكلى'
        : 'Specialized nutrition for diabetes, hypertension, heart disease, and kidney disease patients',
      details: language === 'ar' ? [
        'خطط تغذية متوافقة مع الأدوية والعلاج',
        'مراقبة مستويات السكر والضغط',
        'تقليل المضاعفات والأعراض',
        'تحسين جودة الحياة اليومية',
        'تنسيق مع الفريق الطبي المعالج',
      ] : [
        'Nutrition plans compatible with medications and treatment',
        'Blood sugar and pressure level monitoring',
        'Reducing complications and symptoms',
        'Improving daily quality of life',
        'Coordination with treating medical team',
      ],
    },
    {
      icon: TrendingUp,
      title: language === 'ar' ? 'التغذية الرياضية' : 'Sports Nutrition',
      description: language === 'ar'
        ? 'خطط تغذية متخصصة للرياضيين لتحسين الأداء والتعافي'
        : 'Specialized nutrition plans for athletes to improve performance and recovery',
      details: language === 'ar' ? [
        'تخطيط الوجبات حول جدول التدريب',
        'تحسين الطاقة والقدرة على التحمل',
        'استراتيجيات التعافي بعد التمرين',
        'إدارة الوزن مع الحفاظ على الكتلة العضلية',
        'مكملات غذائية آمنة وفعالة',
      ] : [
        'Meal planning around training schedule',
        'Improving energy and endurance',
        'Post-workout recovery strategies',
        'Weight management while preserving muscle mass',
        'Safe and effective nutritional supplements',
      ],
    },
    {
      icon: Baby,
      title: language === 'ar' ? 'تغذية الأطفال' : 'Pediatric Nutrition',
      description: language === 'ar'
        ? 'برامج تغذية صحية لنمو وتطور الأطفال بشكل سليم'
        : 'Healthy nutrition programs for proper child growth and development',
      details: language === 'ar' ? [
        'تقييم النمو والتطور الغذائي',
        'علاج سوء التغذية والنحافة',
        'برامج لزيادة الوزن الصحي',
        'تعليم العادات الغذائية الصحية',
        'التعامل مع صعوبات الأكل',
      ] : [
        'Growth and nutritional development assessment',
        'Treating malnutrition and underweight',
        'Healthy weight gain programs',
        'Teaching healthy eating habits',
        'Dealing with eating difficulties',
      ],
    },
    {
      icon: Heart,
      title: language === 'ar' ? 'رعاية ما قبل وبعد الولادة' : 'Prenatal & Postnatal Care',
      description: language === 'ar'
        ? 'دعم تغذوي شامل للأمهات والأطفال خلال فترة الحمل والرضاعة'
        : 'Comprehensive nutritional support for mothers and babies during pregnancy and breastfeeding',
      details: language === 'ar' ? [
        'تغذية متوازنة للحمل الصحي',
        'إدارة الوزن أثناء وبعد الحمل',
        'التعامل مع غثيان الحمل وحرقة المعدة',
        'تغذية الرضاعة الطبيعية',
        'استعادة الصحة بعد الولادة',
      ] : [
        'Balanced nutrition for healthy pregnancy',
        'Weight management during and after pregnancy',
        'Dealing with morning sickness and heartburn',
        'Breastfeeding nutrition',
        'Postpartum health recovery',
      ],
    },
    {
      icon: AlertCircle,
      title: language === 'ar' ? 'الحساسية الغذائية وعدم التحمل' : 'Food Allergies & Intolerances',
      description: language === 'ar'
        ? 'خطط وجبات آمنة ومتوازنة لمن يعانون من الحساسية الغذائية'
        : 'Safe and balanced meal plans for those with food allergies',
      details: language === 'ar' ? [
        'تحديد الأطعمة المسببة للحساسية',
        'بدائل غذائية آمنة ومغذية',
        'قراءة وفهم الملصقات الغذائية',
        'خطط وجبات متنوعة وآمنة',
        'متابعة الأعراض والتحسن',
      ] : [
        'Identifying allergenic foods',
        'Safe and nutritious food alternatives',
        'Reading and understanding food labels',
        'Diverse and safe meal plans',
        'Monitoring symptoms and improvement',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </h1>
            <p className="text-xl text-primary font-semibold mb-4">
              {language === 'ar' ? 'حلول تغذية شاملة ومتخصصة' : 'Comprehensive and Specialized Nutrition Solutions'}
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {language === 'ar'
                ? 'نقدم مجموعة متكاملة من الخدمات الغذائية المصممة خصيصاً لتلبية احتياجاتك الصحية الفريدة'
                : 'We offer a comprehensive range of nutritional services specifically designed to meet your unique health needs'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow border-2 hover:border-primary">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div>
                        <service.icon className="w-16 h-16 text-primary mb-4" />
                        <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                        <p className="text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-lg mb-4">
                          {language === 'ar' ? 'ما نقدمه:' : 'What We Offer:'}
                        </h4>
                        <div className="space-y-3">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-muted-foreground">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === 'ar' ? 'جاهز لبدء رحلتك الصحية؟' : 'Ready to Start Your Health Journey?'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'احجز استشارتك الأولى اليوم وابدأ في تحقيق أهدافك الصحية مع خطة تغذية مخصصة لك'
                : 'Book your first consultation today and start achieving your health goals with a personalized nutrition plan'}
            </p>
            <Link href="/booking">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
