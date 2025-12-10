'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/lib/auth-client';
import { Menu, X, Moon, Sun, Globe, User, ShieldCheck, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/services', label: t('nav.services') },
    { href: '/bmi-calculator', label: language === 'ar' ? 'حاسبة BMI' : 'BMI Calculator' },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/04-1764951246816.png"
                  alt="Dr. Noura Ahmed"
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </motion.div>
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Dr. Noura Ahmed
                </h1>
                <p className="text-xs text-muted-foreground">{t('hero.subtitle')}</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors font-medium relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="rounded-full"
              >
                <Globe className="w-5 h-5" />
              </Button>
            </motion.div>

            {session?.user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:block"
              >
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Login Dropdown for Desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <User className="w-4 h-4" />
                        {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'} className="w-56">
                      <DropdownMenuLabel>
                        {language === 'ar' ? 'اختر نوع الحساب' : 'Choose Account Type'}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/patient-login" className="cursor-pointer">
                          <FileText className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'ملفي الطبي (مرضى)' : 'My Medical Record (Patients)'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/staff-login" className="cursor-pointer">
                          <ShieldCheck className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'لوحة الإدارة (موظفين)' : 'Admin Panel (Staff)'}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="hidden md:block"
                >
                  <Link href="/booking">
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  >
                    {link.label}
                  </Link>
                ))}
                {session?.user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/patient-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <FileText className="w-4 h-4" />
                        {language === 'ar' ? 'ملفي الطبي (مرضى)' : 'My Medical Record'}
                      </Button>
                    </Link>
                    <Link href="/staff-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <ShieldCheck className="w-4 h-4" />
                        {language === 'ar' ? 'لوحة الإدارة (موظفين)' : 'Admin Panel'}
                      </Button>
                    </Link>
                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                        {t('nav.bookNow')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}