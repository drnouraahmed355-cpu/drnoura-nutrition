'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, FileText, Lock, UserCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PatientLoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nationalId: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.nationalId || !formData.password) {
        toast.error(
          language === 'ar'
            ? 'الرجاء إدخال الرقم القومي وكلمة المرور'
            : 'Please enter National ID and password'
        );
        setIsLoading(false);
        return;
      }

      // Sign in using national ID as username
      const { data, error } = await authClient.signIn.email({
        email: `patient_${formData.nationalId}@temp.local`,
        password: formData.password,
        callbackURL: '/patient-ehr',
      });

      if (error?.code) {
        toast.error(
          language === 'ar'
            ? 'الرقم القومي أو كلمة المرور غير صحيحة. الرجاء التأكد من بياناتك.'
            : 'Invalid National ID or password. Please check your credentials.'
        );
        setIsLoading(false);
        return;
      }

      // Success
      toast.success(
        language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!'
      );

      // Redirect to patient EHR
      router.push('/patient-ehr');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.'
          : 'An error occurred during login. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto max-w-md">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'ar' ? 'ملفي الطبي' : 'My Medical Record'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'ar'
                  ? 'سجل دخول للوصول إلى ملفك الطبي'
                  : 'Login to access your medical record'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    {language === 'ar' ? 'الرقم القومي' : 'National ID'}
                  </Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    value={formData.nationalId}
                    onChange={handleChange}
                    placeholder={
                      language === 'ar'
                        ? 'أدخل الرقم القومي'
                        : 'Enter your National ID'
                    }
                    required
                    disabled={isLoading}
                    className="text-lg"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      language === 'ar'
                        ? 'أدخل كلمة المرور'
                        : 'Enter your password'
                    }
                    required
                    disabled={isLoading}
                    className="text-lg"
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
                    </>
                  ) : (
                    <>
                      <FileText className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>
                    {language === 'ar'
                      ? 'إذا لم يكن لديك حساب، الرجاء التواصل مع العيادة'
                      : "If you don't have an account, please contact the clinic"}
                  </p>
                  <p className="text-xs">
                    {language === 'ar'
                      ? 'سيتم إنشاء حساب لك عند تسجيل بياناتك في العيادة'
                      : 'An account will be created for you when you register at the clinic'}
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-primary">
                  {language === 'ar' ? 'معلومات هامة:' : 'Important Information:'}
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>
                    {language === 'ar'
                      ? 'استخدم الرقم القومي الخاص بك لتسجيل الدخول'
                      : 'Use your National ID to login'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'سيتم تزويدك بكلمة المرور من موظف العيادة'
                      : 'You will receive your password from the clinic staff'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? 'يمكنك تغيير كلمة المرور بعد تسجيل الدخول لأول مرة'
                      : 'You can change your password after first login'}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
