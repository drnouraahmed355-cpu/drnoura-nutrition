'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Calculator, Scale, Ruler, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';

type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese' | null;

export default function BMICalculator() {
  const { language } = useLanguage();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<BMICategory>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;

    if (w > 0 && h > 0) {
      const bmiValue = w / (h * h);
      setBmi(Math.round(bmiValue * 10) / 10);

      if (bmiValue < 18.5) setCategory('underweight');
      else if (bmiValue < 25) setCategory('normal');
      else if (bmiValue < 30) setCategory('overweight');
      else setCategory('obese');
    }
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setCategory(null);
  };

  const getCategoryInfo = () => {
    const categories = {
      underweight: {
        ar: 'نقص في الوزن',
        en: 'Underweight',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500',
        advice: {
          ar: 'يُنصح بزيادة السعرات الحرارية بشكل صحي والتركيز على البروتينات والكربوهيدرات المعقدة.',
          en: 'It is recommended to increase calories healthily, focusing on proteins and complex carbohydrates.'
        }
      },
      normal: {
        ar: 'وزن طبيعي',
        en: 'Normal Weight',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500',
        advice: {
          ar: 'ممتاز! حافظ على نمط حياتك الصحي مع التمارين المنتظمة والتغذية المتوازنة.',
          en: 'Excellent! Maintain your healthy lifestyle with regular exercise and balanced nutrition.'
        }
      },
      overweight: {
        ar: 'زيادة في الوزن',
        en: 'Overweight',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500',
        advice: {
          ar: 'يُنصح بتقليل السعرات الحرارية وزيادة النشاط البدني. استشر أخصائي تغذية للحصول على خطة مخصصة.',
          en: 'It is recommended to reduce calories and increase physical activity. Consult a nutritionist for a personalized plan.'
        }
      },
      obese: {
        ar: 'سمنة',
        en: 'Obese',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500',
        advice: {
          ar: 'يُنصح بشدة بمراجعة أخصائي تغذية لوضع خطة علاجية شاملة تشمل التغذية والرياضة.',
          en: 'It is strongly recommended to see a nutritionist for a comprehensive treatment plan including diet and exercise.'
        }
      }
    };
    return category ? categories[category] : null;
  };

  const categoryInfo = getCategoryInfo();

  const bmiRanges = [
    { range: '< 18.5', label: language === 'ar' ? 'نقص في الوزن' : 'Underweight', color: 'bg-blue-500' },
    { range: '18.5 - 24.9', label: language === 'ar' ? 'وزن طبيعي' : 'Normal', color: 'bg-green-500' },
    { range: '25 - 29.9', label: language === 'ar' ? 'زيادة في الوزن' : 'Overweight', color: 'bg-yellow-500' },
    { range: '≥ 30', label: language === 'ar' ? 'سمنة' : 'Obese', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'حاسبة مؤشر كتلة الجسم' : 'BMI Calculator'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'ar' 
                ? 'اكتشف مؤشر كتلة جسمك واحصل على نصائح مخصصة'
                : 'Discover your body mass index and get personalized advice'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    {language === 'ar' ? 'أدخل بياناتك' : 'Enter Your Data'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      {language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder={language === 'ar' ? 'مثال: 70' : 'e.g., 70'}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      {language === 'ar' ? 'الطول (سم)' : 'Height (cm)'}
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder={language === 'ar' ? 'مثال: 170' : 'e.g., 170'}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={calculateBMI} 
                      className="flex-1 bg-gradient-to-r from-primary to-secondary"
                      disabled={!weight || !height}
                    >
                      {language === 'ar' ? 'احسب' : 'Calculate'}
                    </Button>
                    <Button onClick={reset} variant="outline">
                      {language === 'ar' ? 'إعادة' : 'Reset'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    {language === 'ar' ? 'تصنيفات BMI' : 'BMI Categories'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bmiRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${range.color}`} />
                        <span className="font-mono text-sm">{range.range}</span>
                        <span className="text-muted-foreground">{range.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {bmi !== null && categoryInfo ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`border-2 ${categoryInfo.border} ${categoryInfo.bg}`}>
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                          className="text-7xl font-bold mb-2"
                        >
                          <span className={categoryInfo.color}>{bmi}</span>
                        </motion.div>
                        <p className="text-xl text-muted-foreground">
                          {language === 'ar' ? 'مؤشر كتلة الجسم' : 'BMI'}
                        </p>
                      </div>

                      <div className={`rounded-lg p-4 ${categoryInfo.bg} border ${categoryInfo.border} mb-6`}>
                        <h3 className={`text-2xl font-bold ${categoryInfo.color} mb-2 text-center`}>
                          {language === 'ar' ? categoryInfo.ar : categoryInfo.en}
                        </h3>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          {language === 'ar' ? 'نصيحة' : 'Advice'}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {language === 'ar' ? categoryInfo.advice.ar : categoryInfo.advice.en}
                        </p>
                      </div>

                      <Link href="/booking">
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                          {language === 'ar' ? 'احجز استشارة مع د. نورا' : 'Book Consultation with Dr. Noura'}
                          <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="border-2 border-dashed h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Calculator className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      {language === 'ar' 
                        ? 'أدخل وزنك وطولك لحساب مؤشر كتلة الجسم'
                        : 'Enter your weight and height to calculate BMI'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Card className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  {language === 'ar'
                    ? 'هل تحتاج مساعدة متخصصة؟ د. نورا أحمد متخصصة في التغذية العلاجية وإدارة الوزن.'
                    : 'Need specialized help? Dr. Noura Ahmed specializes in clinical nutrition and weight management.'}
                </p>
                <Link href="/booking">
                  <Button variant="outline" className="border-2 border-primary">
                    {language === 'ar' ? 'احجز موعدك الآن' : 'Book Your Appointment Now'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
