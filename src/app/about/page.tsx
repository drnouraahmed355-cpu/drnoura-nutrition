'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award, GraduationCap, Briefcase, Heart, Users, Target, CheckCircle, Activity, Stethoscope, Medal, TrendingUp, Scale, Baby } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  const qualifications = [
    {
      icon: GraduationCap,
      title: language === 'ar' ? 'ماجستير تغذية صحية' : 'Master\'s in Healthy Nutrition',
      institution: language === 'ar' ? 'جامعة القاهرة' : 'Cairo University',
    },
    {
      icon: GraduationCap,
      title: language === 'ar' ? 'دبلومة تغذية صحية' : 'Diploma in Healthy Nutrition',
      institution: language === 'ar' ? 'نقابة الزراعيين' : 'Agricultural Syndicate',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'كلية زراعة - علوم وتكنولوجيا الأغذية والتغذية' : 'Bachelor in Food Science & Technology',
      institution: language === 'ar' ? 'جامعة عين شمس' : 'Ain Shams University',
    },
  ];

  const certifications = [
    language === 'ar' ? 'دورة إدارة المستشفيات' : 'Hospital Management Course',
    language === 'ar' ? 'دورة تنمية القدرات والمهارات الحياتية' : 'Life Skills & Capabilities Development Course',
    language === 'ar' ? 'شهادة من معهد إعداد القادة بحلوان بالإشراف على التغذية' : 'Leadership Institute Certificate in Nutrition Supervision - Helwan',
    language === 'ar' ? 'شهادة من مستشفى صبيا العام عن مسؤولية الأخطاء الطبية' : 'Medical Errors Responsibility Certificate - Sabya General Hospital',
  ];

  const expertise = [
    {
      icon: TrendingUp,
      title: language === 'ar' ? 'تغذية رياضية' : 'Sports Nutrition',
      description: language === 'ar' 
        ? 'برامج تغذية متخصصة للرياضيين لتحسين الأداء والوصول للأهداف الرياضية'
        : 'Specialized nutrition programs for athletes to improve performance and achieve sports goals',
    },
    {
      icon: Baby,
      title: language === 'ar' ? 'تغذية الطفل والطفل الرياضي والمسنين' : 'Child, Young Athlete & Elderly Nutrition',
      description: language === 'ar'
        ? 'برامج تغذية مخصصة لمراحل النمو المختلفة واحتياجات المسنين الخاصة'
        : 'Customized nutrition programs for different growth stages and special elderly needs',
    },
    {
      icon: Scale,
      title: language === 'ar' ? 'متابعة حالات السمنة وما بعد جراحات السمنة' : 'Obesity & Post-Bariatric Surgery Follow-up',
      description: language === 'ar'
        ? 'متابعة شاملة لحالات السمنة والرعاية الخاصة بعد جراحات السمنة'
        : 'Comprehensive obesity follow-up and special care after bariatric surgery',
    },
    {
      icon: Stethoscope,
      title: language === 'ar' ? 'عيادة تغذية علاجية خبرة عملية' : 'Clinical Nutrition Practice',
      description: language === 'ar'
        ? 'خبرة عملية في عيادات التغذية العلاجية والتعامل مع الحالات المختلفة'
        : 'Practical experience in clinical nutrition clinics and handling various cases',
    },
    {
      icon: Activity,
      title: language === 'ar' ? 'تغذية علاجية للأمراض المزمنة (السكر – الكبد...)' : 'Therapeutic Nutrition for Chronic Diseases',
      description: language === 'ar'
        ? 'برامج تغذية علاجية متخصصة لمرضى السكر والكبد والأمراض المزمنة'
        : 'Specialized therapeutic nutrition programs for diabetes, liver disease and chronic conditions',
    },
    {
      icon: Heart,
      title: language === 'ar' ? 'متابعة أونلاين لحالات السمنة ومرضى السكر والضغط' : 'Online Follow-up for Obesity, Diabetes & Hypertension',
      description: language === 'ar'
        ? 'خدمة متابعة عن بعد لمرضى السمنة والسكري وارتفاع ضغط الدم'
        : 'Remote follow-up service for obesity, diabetes and hypertension patients',
    },
    {
      icon: Medal,
      title: language === 'ar' ? 'العمل على أجهزة التخسيس وتقنية الميزوثيرابي' : 'Weight Loss Devices & Mesotherapy',
      description: language === 'ar'
        ? 'استخدام أحدث تقنيات التخسيس وتقنية الميزوثيرابي للحصول على أفضل النتائج'
        : 'Using latest weight loss technologies and mesotherapy techniques for best results',
    },
  ];

  const services = [
    language === 'ar' ? 'خدمة السمنة' : 'Obesity Service',
    language === 'ar' ? 'التغذية العلاجية' : 'Therapeutic Nutrition',
    language === 'ar' ? 'تغذية الأطفال' : 'Pediatric Nutrition',
    language === 'ar' ? 'التغذية الرياضية' : 'Sports Nutrition',
    language === 'ar' ? 'المتابعة أونلاين' : 'Online Follow-up',
    language === 'ar' ? 'حساب السعرات وتحديد الهدف' : 'Calorie Calculation & Goal Setting',
  ];

  const philosophyPoints = [
    language === 'ar' ? 'نهج شامل يركز على صحة الفرد بشكل كامل' : 'Holistic approach focusing on complete individual health',
    language === 'ar' ? 'خطط تغذية مبنية على أحدث الأبحاث العلمية' : 'Nutrition plans based on latest scientific research',
    language === 'ar' ? 'استراتيجيات مستدامة طويلة الأمد' : 'Sustainable long-term strategies',
    language === 'ar' ? 'متابعة مستمرة ودعم شامل للمرضى' : 'Continuous follow-up and comprehensive patient support',
    language === 'ar' ? 'تعليم المرضى وتمكينهم لاتخاذ قرارات صحية' : 'Patient education and empowerment for health decisions',
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'ar' ? 'د. نورا أحمد' : 'Dr. Noura Ahmed'}
              </h1>
              <p className="text-xl text-primary font-semibold mb-6">
                {language === 'ar' ? 'أخصائي تغذية علاجية' : 'Clinical Nutrition Specialist'}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {language === 'ar'
                  ? 'د. نورا أحمد أخصائية تغذية علاجية معتمدة مع سنوات من الخبرة في مجال التغذية العلاجية والرياضية. تمتلك خبرة واسعة في التعامل مع مختلف الحالات من السمنة والأمراض المزمنة إلى التغذية الرياضية وتغذية الأطفال.'
                  : 'Dr. Noura Ahmed is a certified clinical nutrition specialist with years of experience in therapeutic and sports nutrition. She has extensive experience dealing with various cases from obesity and chronic diseases to sports nutrition and pediatric nutrition.'}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === 'ar'
                  ? 'نهجها الشامل يجمع بين العلم الحديث والفهم العميق لاحتياجات كل مريض، مما يضمن تحقيق أفضل النتائج الصحية.'
                  : 'Her holistic approach combines modern science with deep understanding of each patient\'s needs, ensuring the best health outcomes.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2s6jak2s6jak2s6j-1764947315072.png"
                  alt="Dr. Noura Ahmed"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Education & Qualifications */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'الشهادات التعليمية' : 'Educational Qualifications'}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'المؤهلات الأكاديمية' : 'Academic Credentials'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {qualifications.map((qual, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <qual.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-bold mb-2">{qual.title}</h3>
                    <p className="text-muted-foreground">{qual.institution}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-center mb-8">
              {language === 'ar' ? 'الشهادات والدورات المهنية' : 'Professional Certificates & Courses'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-muted-foreground">{cert}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Expertise */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'الخبرات المهنية' : 'Professional Expertise'}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'مجالات التخصص والخبرة' : 'Areas of Specialization & Experience'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertise.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <exp.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-3">{exp.title}</h3>
                    <p className="text-muted-foreground">{exp.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'أقسام الخدمات' : 'Service Sections'}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'الخدمات المقدمة' : 'Services Offered'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg font-medium">{service}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'فلسفة التغذية العلاجية' : 'Therapeutic Nutrition Philosophy'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'ar'
                ? 'أؤمن بأن التغذية الصحية هي رحلة شخصية فريدة لكل فرد. نهجي يجمع بين العلم الحديث والفهم العميق لاحتياجات كل مريض، مع التركيز على تحقيق نتائج مستدامة طويلة الأمد.'
                : 'I believe that healthy nutrition is a unique personal journey for each individual. My approach combines modern science with deep understanding of each patient\'s needs, focusing on achieving sustainable long-term results.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {philosophyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{point}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}