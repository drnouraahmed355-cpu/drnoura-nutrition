'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Award, 
  Users, 
  Heart, 
  TrendingUp,
  Scale,
  Activity,
  Baby,
  Apple,
  Utensils,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  ShieldCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Home() {
  const { t, language } = useLanguage();

  const services = [
    {
      icon: Scale,
      title: language === 'ar' ? 'خدمة السمنة' : 'Obesity Service',
      description: language === 'ar' ? 'متابعة حالات السمنة وما بعد جراحات السمنة' : 'Obesity follow-up and post-bariatric surgery care',
    },
    {
      icon: Activity,
      title: language === 'ar' ? 'التغذية العلاجية' : 'Therapeutic Nutrition',
      description: language === 'ar' ? 'تغذية علاجية للأمراض المزمنة (السكر – الكبد...)' : 'Therapeutic nutrition for chronic diseases (diabetes, liver...)',
    },
    {
      icon: TrendingUp,
      title: language === 'ar' ? 'التغذية الرياضية' : 'Sports Nutrition',
      description: language === 'ar' ? 'تغذية رياضية وتغذية الطفل الرياضي' : 'Sports nutrition and young athlete nutrition',
    },
    {
      icon: Baby,
      title: language === 'ar' ? 'تغذية الأطفال' : 'Pediatric Nutrition',
      description: language === 'ar' ? 'تغذية الطفل والمسنين' : 'Child and elderly nutrition',
    },
    {
      icon: Heart,
      title: language === 'ar' ? 'المتابعة أونلاين' : 'Online Follow-up',
      description: language === 'ar' ? 'متابعة أونلاين لحالات السمنة ومرضى السكر والضغط' : 'Online follow-up for obesity, diabetes and hypertension cases',
    },
    {
      icon: AlertCircle,
      title: language === 'ar' ? 'حساب السعرات' : 'Calorie Calculation',
      description: language === 'ar' ? 'حساب السعرات وتحديد الهدف' : 'Calorie calculation and goal setting',
    },
  ];

  const credentials = [
    { 
      icon: Award, 
      text: language === 'ar' ? 'ماجستير تغذية صحية – جامعة القاهرة' : 'Master\'s in Healthy Nutrition - Cairo University'
    },
    { 
      icon: Award, 
      text: language === 'ar' ? 'دبلومة تغذية صحية – نقابة الزراعيين' : 'Diploma in Healthy Nutrition - Agricultural Syndicate'
    },
    { 
      icon: Award, 
      text: language === 'ar' ? 'كلية زراعة – علوم وتكنولوجيا الأغذية والتغذية' : 'Bachelor in Food Science & Technology'
    },
    { 
      icon: Award, 
      text: language === 'ar' ? 'دورات متخصصة في إدارة المستشفيات وتنمية المهارات' : 'Specialized courses in hospital management'
    },
  ];

  const testimonials = [
    {
      name: language === 'ar' ? 'سارة محمد' : 'Sarah Mohammed',
      text: language === 'ar' 
        ? 'د. نورا غيرت حياتي! فقدت 15 كيلو بطريقة صحية ومستدامة. أشعر بتحسن كبير في طاقتي وصحتي العامة.'
        : 'Dr. Noura changed my life! I lost 15kg in a healthy and sustainable way. I feel much better in my energy and overall health.',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'أحمد حسن' : 'Ahmed Hassan',
      text: language === 'ar'
        ? 'خطة التغذية الرياضية ساعدتني في تحسين أدائي الرياضي بشكل ملحوظ. أنصح بها جميع الرياضيين.'
        : 'The sports nutrition plan helped me improve my athletic performance significantly. I recommend it to all athletes.',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'مريم علي' : 'Maryam Ali',
      text: language === 'ar'
        ? 'متابعة مستمرة واهتمام حقيقي بحالتي الصحية. تجربة رائعة ونتائج ممتازة.'
        : 'Continuous follow-up and genuine care for my health condition. Wonderful experience and excellent results.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10+', label: language === 'ar' ? 'سنوات خبرة' : 'Years Experience' },
    { number: '2000+', label: language === 'ar' ? 'مريض سعيد' : 'Happy Patients' },
    { number: '95%', label: language === 'ar' ? 'نسبة النجاح' : 'Success Rate' },
    { number: '24/7', label: language === 'ar' ? 'الدعم' : 'Support' },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
                  {t('hero.title').split(' ').slice(0, 3).join(' ')}
                </span>
                <br />
                <span>{t('hero.title').split(' ').slice(3).join(' ')}</span>
              </motion.h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-semibold">
                {t('hero.subtitle')}
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                {t('hero.description')}
              </p>
              <div className="flex flex-col gap-4">
                {/* Primary Action - Book Now */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/booking" className="block">
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                      {t('hero.cta')}
                      <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </motion.div>

                {/* Login Options - Separate Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/patient-login" className="block">
                      <Button size="lg" variant="outline" className="w-full border-2 border-primary/50 hover:border-primary hover:bg-primary/5">
                        <FileText className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <span className="text-sm">
                          {language === 'ar' ? 'ملفي الطبي' : 'Medical Record'}
                        </span>
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/staff-login" className="block">
                      <Button size="lg" variant="outline" className="w-full border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/5">
                        <ShieldCheck className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <span className="text-sm">
                          {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                        </span>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2s6jak2s6jak2s6j-1764947315072.png"
                  alt="Dr. Noura Ahmed"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
              <motion.div 
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-secondary/30 to-transparent blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [360, 180, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                  <CardContent className="pt-6">
                    <motion.h3 
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {stat.number}
                    </motion.h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Dr. Noura */}
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
              {t('about.title')}
            </h2>
            <p className="text-xl text-primary font-semibold">
              {language === 'ar' ? 'أخصائي تغذية علاجية' : 'Clinical Nutrition Specialist'}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto mb-12">
            <motion.p 
              className="text-lg text-muted-foreground text-center leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {language === 'ar'
                ? 'د. نورا أحمد – أخصائي تغذية علاجية معتمدة مع خبرة واسعة في مجالات متعددة تشمل التغذية الرياضية، تغذية الأطفال والمسنين، متابعة حالات السمنة وما بعد جراحات السمنة، والتغذية العلاجية للأمراض المزمنة. تتميز بخبرة عملية في العمل على أجهزة التخسيس وتقنية الميزوثيرابي، بالإضافة إلى تقديم خدمة المتابعة أونلاين للمرضى.'
                : 'Dr. Noura Ahmed – Certified clinical nutrition specialist with extensive experience in multiple fields including sports nutrition, pediatric and elderly nutrition, obesity and post-bariatric surgery follow-up, and therapeutic nutrition for chronic diseases. Distinguished by practical experience in weight loss devices and mesotherapy techniques, in addition to providing online follow-up services for patients.'}
            </motion.p>
          </div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">{t('credentials.title')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {credentials.map((credential, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                    <CardContent className="pt-6 text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <credential.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                      </motion.div>
                      <p className="font-medium">{credential.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
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
              {t('services.title')}
            </h2>
            <p className="text-xl text-primary font-semibold">{t('services.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full hover:shadow-xl transition-all border-2 hover:border-primary/50 group">
                  <CardContent className="pt-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <service.icon className="w-12 h-12 text-primary mb-4 group-hover:text-secondary transition-colors" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/services">
                <Button size="lg" variant="outline" className="border-2">
                  {language === 'ar' ? 'عرض جميع الخدمات' : 'View All Services'}
                  <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
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
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-primary font-semibold">{t('testimonials.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all border-2 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 fill-secondary text-secondary" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{testimonial.text}</p>
                    <p className="font-bold text-primary">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Map */}
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
              {t('contact.title')}
            </h2>
            <p className="text-xl text-primary font-semibold">{t('contact.subtitle')}</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-primary/20 hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <motion.a
                      href="https://maps.app.goo.gl/Vj6N72XdtwqU38JBA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 cursor-pointer"
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    >
                      <MapPin className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.address')}</h4>
                        <p className="text-muted-foreground">
                          {language === 'ar' ? 'القناطر الخيرية، القليوبية' : 'Al Qanater, Qalyubia'}
                        </p>
                      </div>
                    </motion.a>
                    <motion.div 
                      className="flex items-start gap-4"
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    >
                      <Phone className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.phone')}</h4>
                        <p className="text-muted-foreground" dir="ltr">01019295074</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-start gap-4"
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    >
                      <Mail className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.email')}</h4>
                        <p className="text-muted-foreground">Dr.nouraahmed1@gmail.com</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-start gap-4"
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    >
                      <Users className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.hours')}</h4>
                        <p className="text-muted-foreground">
                          {language === 'ar' ? 'الاثنين: 4-6 مساءً | الجمعة: 6-8 مساءً' : 'Monday: 4-6 PM | Friday: 6-8 PM'}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/booking">
                      <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                        {t('nav.bookNow')}
                        <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-lg h-[400px] border-2 border-primary/20"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.8936394722194!2d31.124431!3d30.196733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDExJzQ4LjIiTiAzMcKwMDcnMjcuOSJF!5e0!3m2!1sen!2seg!4v1234567890!5m2!1sen!2seg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}