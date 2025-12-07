'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ShieldCheck, UserCog } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StaffLoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: '/dashboard',
      });

      if (error) {
        toast.error(
          language === 'ar'
            ? 'بيانات الدخول غير صحيحة'
            : 'Invalid credentials'
        );
        setIsLoading(false);
        return;
      }

      // Check user role
      const roleResponse = await fetch('/api/auth/role');
      const roleData = await roleResponse.json();

      if (roleData.role === 'patient') {
        await authClient.signOut();
        toast.error(
          language === 'ar'
            ? 'هذه الصفحة مخصصة للموظفين والأطباء فقط'
            : 'This page is for staff and doctors only'
        );
        setIsLoading(false);
        return;
      }

      // Check if password needs change
      if (roleData.passwordNeedsChange) {
        toast.info(
          language === 'ar'
            ? 'يجب تغيير كلمة المرور عند أول تسجيل دخول'
            : 'Please change your password on first login'
        );
        router.push('/dashboard?changePassword=true');
        return;
      }

      toast.success(
        language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful'
      );
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'Login error'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {language === 'ar'
                ? 'تسجيل دخول الموظفين'
                : 'Staff Login'}
            </CardTitle>
            <CardDescription className="text-base">
              {language === 'ar'
                ? 'لوحة التحكم للأطباء والموظفين'
                : 'Dashboard for Doctors and Staff'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={
                    language === 'ar'
                      ? 'أدخل البريد الإلكتروني'
                      : 'Enter your email'
                  }
                  required
                  disabled={isLoading}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={
                      language === 'ar'
                        ? 'أدخل كلمة المرور'
                        : 'Enter your password'
                    }
                    required
                    disabled={isLoading}
                    className="text-lg pr-10"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-12 bg-gradient-to-r from-primary to-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    <UserCog className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'هل أنت مريض؟'
                  : 'Are you a patient?'}
              </p>
              <Link href="/patient-login">
                <Button variant="outline" className="w-full">
                  {language === 'ar'
                    ? 'تسجيل دخول المرضى'
                    : 'Patient Login'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {language === 'ar'
            ? 'يتم توفير بيانات الدخول من قبل الإدارة'
            : 'Login credentials are provided by administration'}
        </p>
      </motion.div>
    </div>
  );
}
