'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle, ArrowRight } from 'lucide-react';
import { FaTiktok, FaTelegram } from 'react-icons/fa';

export default function ContactPage() {
  const { language } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      title: language === 'ar' ? 'العنوان' : 'Address',
      content: language === 'ar' ? 'أمام مستشفى المنيرة – بجوار جيم فيتنس' : 'In front of Al-Manira Hospital - Next to Gym Fitness',
      subContent: language === 'ar' ? 'القناطر الخيرية – القليوبية' : 'Al Qanater Al Khayreya - Qalyubia',
    },
    {
      icon: Phone,
      title: language === 'ar' ? 'الهاتف / واتساب / تليجرام' : 'Phone / WhatsApp / Telegram',
      content: '01019295074',
      subContent: language === 'ar' ? 'متاح للرد على استفساراتكم' : 'Available for your inquiries',
      isRTL: true,
    },
    {
      icon: Mail,
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      content: 'Dr.nouraahmed1@gmail.com',
      subContent: language === 'ar' ? 'سنرد عليك في أقرب وقت' : 'We\'ll reply as soon as possible',
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'مواعيد العيادة' : 'Clinic Hours',
      content: language === 'ar' ? 'الاثنين: 4-6 مساءً | الجمعة: 6-8 مساءً' : 'Monday: 4-6 PM | Friday: 6-8 PM',
      subContent: language === 'ar' ? 'يُفضل الحجز المسبق' : 'Prior booking preferred',
    },
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: 'Facebook',
      username: '@dt.noura.ahmed',
      link: 'https://www.facebook.com/dt.noura.ahmed',
      color: 'hover:from-blue-500 hover:to-blue-600',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      username: '@DR.NOURA_AHMED3',
      link: 'https://www.instagram.com/DR.NOURA_AHMED3',
      color: 'hover:from-pink-500 hover:to-purple-600',
    },
    {
      icon: FaTiktok,
      name: 'TikTok',
      username: '@dt.noura.ahmed',
      link: 'https://www.tiktok.com/@dt.noura.ahmed',
      color: 'hover:from-gray-800 hover:to-gray-900',
    },
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      username: '01019295074',
      link: 'https://wa.me/201019295074',
      color: 'hover:from-green-500 hover:to-green-600',
    },
    {
      icon: FaTelegram,
      name: 'Telegram',
      username: '01019295074',
      link: 'https://t.me/201019295074',
      color: 'hover:from-blue-400 hover:to-blue-500',
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
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </span>
            </motion.h1>
            <p className="text-xl text-primary font-semibold mb-4">
              {language === 'ar' ? 'نحن هنا للمساعدة' : 'We\'re Here to Help'}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar'
                ? 'تواصل معنا اليوم واحصل على استشارة مجانية حول كيفية تحسين صحتك من خلال التغذية السليمة'
                : 'Contact us today and get a free consultation on how to improve your health through proper nutrition'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all text-center border-2 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <info.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-lg mb-2">{info.title}</h3>
                    <p className={`text-foreground font-semibold mb-1 ${info.isRTL ? 'dir-ltr' : ''}`}>
                      {info.content}
                    </p>
                    <p className="text-sm text-muted-foreground">{info.subContent}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold mb-4">
              {language === 'ar' ? 'تابعنا على مواقع التواصل' : 'Follow Us on Social Media'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {language === 'ar'
                ? 'ابق على اطلاع بأحدث النصائح والمعلومات الغذائية'
                : 'Stay updated with the latest nutrition tips and information'}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {socialMedia.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <Card className="hover:shadow-xl transition-all border-2 hover:border-primary/50">
                    <CardContent className="pt-6 px-8">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4 transition-all ${social.color} group-hover:text-white`}>
                        <social.icon className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold mb-1">{social.name}</h4>
                      <p className="text-sm text-muted-foreground">{social.username}</p>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Map & Quick Contact */}
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">
                {language === 'ar' ? 'موقعنا' : 'Our Location'}
              </h3>
              <div className="rounded-lg overflow-hidden shadow-lg h-[400px] border-2 border-primary/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.123!2d31.234!3d30.567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDM0JzAxLjIiTiAzMcKwMTQnMDIuNCJF!5e0!3m2!1sen!2seg!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <a 
                  href="https://maps.app.goo.gl/Vj6N72XdtwqU38JBA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {language === 'ar' ? 'افتح في خرائط جوجل' : 'Open in Google Maps'}
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">
                {language === 'ar' ? 'احجز موعدك الآن' : 'Book Your Appointment'}
              </h3>
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-lg mb-6 leading-relaxed">
                    {language === 'ar'
                      ? 'نحن متحمسون لمساعدتك في تحقيق أهدافك الصحية. احجز استشارتك الأولى اليوم وابدأ رحلتك نحو حياة أكثر صحة.'
                      : 'We\'re excited to help you achieve your health goals. Book your first consultation today and start your journey to a healthier life.'}
                  </p>
                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/booking">
                        <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                          {language === 'ar' ? 'احجز استشارة' : 'Book Consultation'}
                          <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <a href="https://wa.me/201019295074" target="_blank" rel="noopener noreferrer">
                        <Button size="lg" variant="outline" className="w-full border-2">
                          <MessageCircle className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                        </Button>
                      </a>
                    </motion.div>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? '💚 نقدم استشارة أولية مجانية لمدة 15 دقيقة لمناقشة احتياجاتك وأهدافك'
                        : '💚 We offer a free 15-minute initial consultation to discuss your needs and goals'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}