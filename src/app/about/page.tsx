'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award, GraduationCap, Briefcase, Heart, Users, Target, CheckCircle, Activity } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  const qualifications = [
    {
      icon: GraduationCap,
      title: language === 'ar' ? 'دكتوراه في التغذية العلاجية' : 'PhD in Clinical Nutrition',
      institution: language === 'ar' ? 'جامعة القاهرة، مصر' : 'Cairo University, Egypt',
      year: '2014',
    },
    {
      icon: GraduationCap,
      title: language === 'ar' ? 'ماجستير في علوم التغذية' : 'Master\'s in Nutritional Sciences',
      institution: language === 'ar' ? 'الجامعة الأمريكية بالقاهرة' : 'American University in Cairo',
      year: '2011',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'بكالوريوس علوم الأغذية والتغذية' : 'Bachelor\'s in Food Science & Nutrition',
      institution: language === 'ar' ? 'جامعة عين شمس، مصر' : 'Ain Shams University, Egypt',
      year: '2008',
    },
  ];

  const certifications = [
    language === 'ar' ? 'أخصائية تغذية معتمدة من المجلس الأمريكي' : 'Board Certified Nutrition Specialist (USA)',
    language === 'ar' ? 'عضو الجمعية الدولية للتغذية' : 'Member of International Nutrition Society',
    language === 'ar' ? 'شهادة في التغذية الرياضية' : 'Certified Sports Nutritionist',
    language === 'ar' ? 'شهادة في تغذية الأطفال' : 'Pediatric Nutrition Specialist',
    language === 'ar' ? 'مدرب صحة معتمد' : 'Certified Health Coach',
    language === 'ar' ? 'شهادة في إدارة السمنة' : 'Obesity Management Specialist',
  ];

  const specializations = [
    {
      icon: Heart,
      title: language === 'ar' ? 'إدارة الوزن' : 'Weight Management',
      description: language === 'ar' 
        ? 'خبرة واسعة في مساعدة المرضى على تحقيق أهدافهم في الوزن من خلال خطط تغذية مستدامة وفعالة'
        : 'Extensive experience helping patients achieve their weight goals through sustainable and effective nutrition plans',
    },
    {
      icon: Activity,
      title: language === 'ar' ? 'الأمراض المزمنة' : 'Chronic Disease Management',
      description: language === 'ar'
        ? 'متخصصة في إدارة مرض السكري، ارتفاع ضغط الدم، أمراض القلب، والحالات الصحية المزمنة الأخرى'
        : 'Specialized in managing diabetes, hypertension, heart disease, and other chronic health conditions',
    },
    {
      icon: Users,
      title: language === 'ar' ? 'التغذية العائلية' : 'Family Nutrition',
      description: language === 'ar'
        ? 'مساعدة العائلات على تبني عادات غذائية صحية وتحسين نمط حياتهم الغذائي'
        : 'Helping families adopt healthy eating habits and improve their nutritional lifestyle',
    },
    {
      icon: Target,
      title: language === 'ar' ? 'التغذية التخصصية' : 'Specialized Nutrition',
      description: language === 'ar'
        ? 'خطط تغذية مخصصة للرياضيين، النساء الحوامل، والأطفال، وحالات الحساسية الغذائية'
        : 'Customized nutrition plans for athletes, pregnant women, children, and food allergy cases',
    },
  ];

  const philosophyPoints = [
    language === 'ar' ? 'نهج شامل يركز على الفرد ككل وليس فقط النظام الغذائي' : 'Holistic approach focusing on the individual as a whole, not just the diet',
    language === 'ar' ? 'خطط تغذية مبنية على الأدلة العلمية والأبحاث الحديثة' : 'Evidence-based nutrition plans backed by current research',
    language === 'ar' ? 'استراتيجيات مستدامة طويلة الأمد وليست حلولاً مؤقتة' : 'Sustainable long-term strategies, not temporary solutions',
    language === 'ar' ? 'متابعة مستمرة ودعم شامل لتحقيق النجاح' : 'Continuous follow-up and comprehensive support for success',
    language === 'ar' ? 'تعليم المرضى وتمكينهم لاتخاذ قرارات صحية مستنيرة' : 'Patient education and empowerment for informed health decisions',
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
                {language === 'ar' ? 'عن د. نورا أحمد' : 'About Dr. Noura Ahmed'}
              </h1>
              <p className="text-xl text-primary font-semibold mb-6">
                {language === 'ar' ? 'أخصائية التغذية العلاجية' : 'Clinical Nutrition Specialist'}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === 'ar'
                  ? 'د. نورا أحمد أخصائية تغذية علاجية معتمدة مع أكثر من 10 سنوات من الخبرة في مجال التغذية الطبية. تمتلك شغفاً حقيقياً بمساعدة الأفراد على تحقيق أهدافهم الصحية من خلال التغذية المتوازنة والعلمية.'
                  : 'Dr. Noura Ahmed is a certified clinical nutrition specialist with over 10 years of experience in medical nutrition. She has a genuine passion for helping individuals achieve their health goals through balanced and scientific nutrition.'}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'المؤهلات الأكاديمية' : 'Academic Qualifications'}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'التعليم والشهادات' : 'Education & Credentials'}
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
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <qual.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-bold mb-2">{qual.title}</h3>
                    <p className="text-muted-foreground mb-2">{qual.institution}</p>
                    <p className="text-primary font-semibold">{qual.year}</p>
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
              {language === 'ar' ? 'الشهادات المهنية' : 'Professional Certifications'}
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

      {/* Specializations */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'مجالات التخصص' : 'Areas of Specialization'}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'الخبرات المتخصصة' : 'Specialized Expertise'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {specializations.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <spec.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-3">{spec.title}</h3>
                    <p className="text-muted-foreground">{spec.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'فلسفتي في العلاج' : 'My Treatment Philosophy'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'ar'
                ? 'أؤمن بأن التغذية الصحية هي رحلة شخصية فريدة لكل فرد. نهجي يجمع بين العلم الحديث والفهم العميق لاحتياجات كل مريض.'
                : 'I believe that healthy nutrition is a unique personal journey for each individual. My approach combines modern science with deep understanding of each patient\'s needs.'}
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