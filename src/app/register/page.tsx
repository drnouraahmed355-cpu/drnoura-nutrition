'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.signUp.email({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    });

    if (error) {
      const errorMessage =
        error.message === 'USER_ALREADY_EXISTS'
          ? language === 'ar'
            ? 'المستخدم مسجل بالفعل'
            : 'User already registered'
          : language === 'ar'
          ? 'فشل التسجيل'
          : 'Registration failed';
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    toast.success(language === 'ar' ? 'تم التسجيل بنجاح' : 'Registered successfully');
    router.push('/login?registered=true');
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">
                  {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'قم بالتسجيل للوصول إلى سجلاتك الطبية وخطط التغذية'
                    : 'Register to access your medical records and nutrition plans'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      language === 'ar' ? 'جاري التسجيل...' : 'Registering...'
                    ) : (
                      <>
                        <UserPlus className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                      {language === 'ar' ? 'سجل الدخول' : 'Login'}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
