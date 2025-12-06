'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Phone, Mail, MapPin, MessageCircle, Globe, Send } from 'lucide-react';
import { FaTiktok, FaTelegramPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/01-1764947294476.png"
                alt="Dr. Noura Ahmed"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <h3 className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Dr. Noura Ahmed
                </h3>
                <p className="text-xs text-muted-foreground">{t('hero.subtitle')}</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">{language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.about')}
              </Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.services')}
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.contact')}
              </Link>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">{t('contact.title')}</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">01019295074</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>Dr.nouraahmed1@gmail.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>{language === 'ar' ? 'القناطر الخيرية، القليوبية' : 'Al Qanater, Qalyubia'}</span>
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">{t('contact.social')}</h4>
            <div className="flex gap-3 flex-wrap">
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://www.facebook.com/dt.noura.ahmed"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://www.instagram.com/DR.NOURA_AHMED3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://www.tiktok.com/@dt.noura.ahmed"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all"
              >
                <FaTiktok className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://t.me/201019295074"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all"
              >
                <FaTelegramPlane className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://wa.me/201019295074"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-primary-foreground transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            © {new Date().getFullYear()} Dr. Noura Ahmed. {t('footer.rights')}
          </p>
          <motion.a
            href="https://mohamed-gomaa-portfolio-website.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'التطوير بواسطة DMG' : 'Developed by DMG'}
            </span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}