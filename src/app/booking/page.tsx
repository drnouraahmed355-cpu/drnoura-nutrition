'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, CheckCircle, Activity, Dumbbell, Moon, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingPage() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    phone: '',
    medicalIssue: '',
    weightGoal: '',
    medications: '',
    previousDiet: '',
    dietMedication: '',
    currentlyWorking: '',
    workType: '',
    workMovement: '',
    lifestyle: '',
    exercise: '',
    sleepPattern: '',
    mentalHealth: '',
    eatingPattern: '',
    consultationTime: '',
    takingVitamins: '',
    vitaminDetails: '',
    favoriteFoods: '',
    dislikedFoods: '',
    dairyAllergy: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.phone || !formData.age || !formData.weight || !formData.height) {
      toast.error(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Format message for WhatsApp
    let message = '';
    if (language === 'ar') {
      message = `🌿 *طلب حجز جديد - د. نورا أحمد*\n\n`;
      message += `👤 *الاسم:* ${formData.name}\n`;
      message += `🎂 *السن:* ${formData.age}\n`;
      message += `⚖️ *الوزن:* ${formData.weight} كجم\n`;
      message += `📏 *الطول:* ${formData.height} سم\n`;
      message += `📱 *الهاتف:* ${formData.phone}\n\n`;
      
      message += `📋 *المعلومات الصحية:*\n`;
      if (formData.medicalIssue) message += `• مشكلة مرضية: ${formData.medicalIssue}\n`;
      if (formData.weightGoal) message += `• الهدف: ${formData.weightGoal}\n`;
      if (formData.medications) message += `• الأدوية/المكملات: ${formData.medications}\n`;
      if (formData.previousDiet) message += `• تجارب دايت سابقة: ${formData.previousDiet}\n`;
      if (formData.dietMedication) message += `• دايت بعلاج تخسيس: ${formData.dietMedication}\n`;
      if (formData.takingVitamins) message += `• تناول فيتامينات: ${formData.takingVitamins}\n`;
      if (formData.vitaminDetails) message += `• تفاصيل الفيتامينات: ${formData.vitaminDetails}\n`;
      if (formData.dairyAllergy) message += `• حساسية الألبان: ${formData.dairyAllergy}\n\n`;
      
      message += `🍽️ *تفضيلات الطعام:*\n`;
      if (formData.favoriteFoods) message += `• الأكل المحبب: ${formData.favoriteFoods}\n`;
      if (formData.dislikedFoods) message += `• الأكل غير المحبب: ${formData.dislikedFoods}\n\n`;
      
      message += `💼 *نمط الحياة:*\n`;
      if (formData.currentlyWorking) message += `• العمل: ${formData.currentlyWorking}\n`;
      if (formData.workType) message += `• نوع العمل: ${formData.workType}\n`;
      if (formData.workMovement) message += `• الحركة في العمل: ${formData.workMovement}\n`;
      if (formData.lifestyle) message += `• نمط الحياة: ${formData.lifestyle}\n`;
      if (formData.exercise) message += `• الرياضة: ${formData.exercise}\n`;
      if (formData.sleepPattern) message += `• معدل النوم: ${formData.sleepPattern}\n`;
      if (formData.mentalHealth) message += `• الحالة النفسية: ${formData.mentalHealth}\n`;
      if (formData.eatingPattern) message += `• نمط الأكل: ${formData.eatingPattern}\n\n`;
      
      if (formData.consultationTime) message += `⏰ *المواعيد المناسبة:* ${formData.consultationTime}`;
    } else {
      message = `🌿 *New Booking Request - Dr. Noura Ahmed*\n\n`;
      message += `👤 *Name:* ${formData.name}\n`;
      message += `🎂 *Age:* ${formData.age}\n`;
      message += `⚖️ *Weight:* ${formData.weight} kg\n`;
      message += `📏 *Height:* ${formData.height} cm\n`;
      message += `📱 *Phone:* ${formData.phone}\n\n`;
      
      message += `📋 *Health Information:*\n`;
      if (formData.medicalIssue) message += `• Medical issue: ${formData.medicalIssue}\n`;
      if (formData.weightGoal) message += `• Goal: ${formData.weightGoal}\n`;
      if (formData.medications) message += `• Medications/Supplements: ${formData.medications}\n`;
      if (formData.previousDiet) message += `• Previous diet experience: ${formData.previousDiet}\n`;
      if (formData.dietMedication) message += `• Diet with medication: ${formData.dietMedication}\n`;
      if (formData.takingVitamins) message += `• Taking vitamins: ${formData.takingVitamins}\n`;
      if (formData.vitaminDetails) message += `• Vitamin details: ${formData.vitaminDetails}\n`;
      if (formData.dairyAllergy) message += `• Dairy allergy: ${formData.dairyAllergy}\n\n`;
      
      message += `🍽️ *Food Preferences:*\n`;
      if (formData.favoriteFoods) message += `• Favorite foods: ${formData.favoriteFoods}\n`;
      if (formData.dislikedFoods) message += `• Disliked foods: ${formData.dislikedFoods}\n\n`;
      
      message += `💼 *Lifestyle:*\n`;
      if (formData.currentlyWorking) message += `• Working: ${formData.currentlyWorking}\n`;
      if (formData.workType) message += `• Work type: ${formData.workType}\n`;
      if (formData.workMovement) message += `• Work movement: ${formData.workMovement}\n`;
      if (formData.lifestyle) message += `• Lifestyle: ${formData.lifestyle}\n`;
      if (formData.exercise) message += `• Exercise: ${formData.exercise}\n`;
      if (formData.sleepPattern) message += `• Sleep pattern: ${formData.sleepPattern}\n`;
      if (formData.mentalHealth) message += `• Mental health: ${formData.mentalHealth}\n`;
      if (formData.eatingPattern) message += `• Eating pattern: ${formData.eatingPattern}\n\n`;
      
      if (formData.consultationTime) message += `⏰ *Preferred time:* ${formData.consultationTime}`;
    }

    // Create WhatsApp link
    const whatsappNumber = '201019295074';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    toast.success(language === 'ar' ? 'تم إرسال طلب الحجز بنجاح!' : 'Booking request sent successfully!');

    // Reset form
    setFormData({
      name: '',
      age: '',
      weight: '',
      height: '',
      phone: '',
      medicalIssue: '',
      weightGoal: '',
      medications: '',
      previousDiet: '',
      dietMedication: '',
      currentlyWorking: '',
      workType: '',
      workMovement: '',
      lifestyle: '',
      exercise: '',
      sleepPattern: '',
      mentalHealth: '',
      eatingPattern: '',
      consultationTime: '',
      takingVitamins: '',
      vitaminDetails: '',
      favoriteFoods: '',
      dislikedFoods: '',
      dairyAllergy: '',
    });

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
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
                {language === 'ar' ? 'احجز استشارتك' : 'Book Your Consultation'}
              </span>
            </motion.h1>
            <p className="text-xl text-primary font-semibold mb-4">
              {language === 'ar' ? 'ابدأ رحلتك الصحية اليوم' : 'Start Your Health Journey Today'}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar'
                ? 'املأ النموذج أدناه وسنتواصل معك عبر واتساب لتأكيد موعدك'
                : 'Fill out the form below and we\'ll contact you via WhatsApp to confirm your appointment'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {language === 'ar' ? 'نموذج الحجز' : 'Booking Form'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{language === 'ar' ? 'الاسم' : 'Name'} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">{language === 'ar' ? 'السن' : 'Age'} *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleChange('age', e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل عمرك' : 'Enter your age'}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'} *</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => handleChange('weight', e.target.value)}
                          placeholder="70"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">{language === 'ar' ? 'الطول (سم)' : 'Height (cm)'} *</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleChange('height', e.target.value)}
                          placeholder="170"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="01xxxxxxxxx"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Health Information */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'المعلومات الصحية' : 'Health Information'}
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="medicalIssue">{language === 'ar' ? 'هل تعاني من أي مشكلة مرضية؟' : 'Do you have any medical conditions?'}</Label>
                      <Textarea
                        id="medicalIssue"
                        value={formData.medicalIssue}
                        onChange={(e) => handleChange('medicalIssue', e.target.value)}
                        placeholder={language === 'ar' ? 'مثل: سكري، ضغط، أمراض قلب...' : 'e.g., diabetes, hypertension, heart disease...'}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightGoal">{language === 'ar' ? 'ما هو هدفك من نزول الوزن؟' : 'What is your weight loss goal?'}</Label>
                      <Input
                        id="weightGoal"
                        value={formData.weightGoal}
                        onChange={(e) => handleChange('weightGoal', e.target.value)}
                        placeholder={language === 'ar' ? 'مثل: نزول 10 كيلو، تحسين الصحة العامة...' : 'e.g., lose 10 kg, improve overall health...'}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medications">{language === 'ar' ? 'هل تتناول أدوية أو مكملات؟' : 'Do you take medications or supplements?'}</Label>
                        <Input
                          id="medications"
                          value={formData.medications}
                          onChange={(e) => handleChange('medications', e.target.value)}
                          placeholder={language === 'ar' ? 'اذكر الأدوية إن وجدت' : 'List medications if any'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="previousDiet">{language === 'ar' ? 'هل جربت دايت قبل كده؟' : 'Have you tried dieting before?'}</Label>
                        <Select value={formData.previousDiet} onValueChange={(value) => handleChange('previousDiet', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">{language === 'ar' ? 'نعم' : 'Yes'}</SelectItem>
                            <SelectItem value="no">{language === 'ar' ? 'لا' : 'No'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietMedication">{language === 'ar' ? 'هل كان بعلاج تخسيس؟' : 'Was it with weight loss medication?'}</Label>
                      <RadioGroup value={formData.dietMedication} onValueChange={(value) => handleChange('dietMedication', value)}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="yes" id="med-yes" />
                          <Label htmlFor="med-yes">{language === 'ar' ? 'نعم' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="no" id="med-no" />
                          <Label htmlFor="med-no">{language === 'ar' ? 'لا' : 'No'}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="takingVitamins">{language === 'ar' ? 'هل تتناول فيتامينات؟' : 'Do you take vitamins?'}</Label>
                      <RadioGroup value={formData.takingVitamins} onValueChange={(value) => handleChange('takingVitamins', value)}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="yes" id="vit-yes" />
                          <Label htmlFor="vit-yes">{language === 'ar' ? 'نعم' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="no" id="vit-no" />
                          <Label htmlFor="vit-no">{language === 'ar' ? 'لا' : 'No'}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vitaminDetails">{language === 'ar' ? 'تفاصيل الفيتامينات' : 'Vitamin details'}</Label>
                      <Textarea
                        id="vitaminDetails"
                        value={formData.vitaminDetails}
                        onChange={(e) => handleChange('vitaminDetails', e.target.value)}
                        placeholder={language === 'ar' ? 'اذكر نوع الفيتامينات أو المكملات' : 'List vitamin types or supplements'}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dairyAllergy">{language === 'ar' ? 'هل تمتلك حساسية من الألبان؟' : 'Do you have dairy allergy?'}</Label>
                      <RadioGroup value={formData.dairyAllergy} onValueChange={(value) => handleChange('dairyAllergy', value)}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="yes" id="dairy-yes" />
                          <Label htmlFor="dairy-yes">{language === 'ar' ? 'نعم' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="no" id="dairy-no" />
                          <Label htmlFor="dairy-no">{language === 'ar' ? 'لا' : 'No'}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="favoriteFoods">{language === 'ar' ? 'الأكل المحبب لك' : 'Your favorite foods'}</Label>
                      <Textarea
                        id="favoriteFoods"
                        value={formData.favoriteFoods}
                        onChange={(e) => handleChange('favoriteFoods', e.target.value)}
                        placeholder={language === 'ar' ? 'اذكر الأطعمة المفضلة لديك' : 'List your favorite foods'}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dislikedFoods">{language === 'ar' ? 'الأكل غير المحبب أو الذي لا تأكله' : 'Foods you dislike or don\'t eat'}</Label>
                      <Textarea
                        id="dislikedFoods"
                        value={formData.dislikedFoods}
                        onChange={(e) => handleChange('dislikedFoods', e.target.value)}
                        placeholder={language === 'ar' ? 'اذكر الأطعمة التي لا تحبها أو لا تأكلها' : 'List foods you dislike or don\'t eat'}
                        rows={2}
                      />
                    </div>
                  </motion.div>

                  {/* Lifestyle Information */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'نمط الحياة' : 'Lifestyle'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentlyWorking">{language === 'ar' ? 'هل تعمل حالياً؟' : 'Are you currently working?'}</Label>
                        <Select value={formData.currentlyWorking} onValueChange={(value) => handleChange('currentlyWorking', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">{language === 'ar' ? 'نعم' : 'Yes'}</SelectItem>
                            <SelectItem value="no">{language === 'ar' ? 'لا' : 'No'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workType">{language === 'ar' ? 'نوع العمل' : 'Type of work'}</Label>
                        <Input
                          id="workType"
                          value={formData.workType}
                          onChange={(e) => handleChange('workType', e.target.value)}
                          placeholder={language === 'ar' ? 'مثل: مكتبي، ميداني...' : 'e.g., office, field...'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workMovement">{language === 'ar' ? 'هل فيه حركة في العمل؟' : 'Is there movement at work?'}</Label>
                      <RadioGroup value={formData.workMovement} onValueChange={(value) => handleChange('workMovement', value)}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="high" id="move-high" />
                          <Label htmlFor="move-high">{language === 'ar' ? 'حركة كثيرة' : 'High movement'}</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="moderate" id="move-mod" />
                          <Label htmlFor="move-mod">{language === 'ar' ? 'حركة متوسطة' : 'Moderate movement'}</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="low" id="move-low" />
                          <Label htmlFor="move-low">{language === 'ar' ? 'حركة قليلة' : 'Low movement'}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lifestyle">{language === 'ar' ? 'نمط الحياة العام' : 'General lifestyle'}</Label>
                      <Textarea
                        id="lifestyle"
                        value={formData.lifestyle}
                        onChange={(e) => handleChange('lifestyle', e.target.value)}
                        placeholder={language === 'ar' ? 'اوصف يومك العادي...' : 'Describe your typical day...'}
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exercise">
                          <Dumbbell className="w-4 h-4 inline mr-2" />
                          {language === 'ar' ? 'هل تمارس رياضة؟' : 'Do you exercise?'}
                        </Label>
                        <Input
                          id="exercise"
                          value={formData.exercise}
                          onChange={(e) => handleChange('exercise', e.target.value)}
                          placeholder={language === 'ar' ? 'نوع ومعدل الرياضة' : 'Type and frequency'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sleepPattern">
                          <Moon className="w-4 h-4 inline mr-2" />
                          {language === 'ar' ? 'معدل النوم' : 'Sleep pattern'}
                        </Label>
                        <Input
                          id="sleepPattern"
                          value={formData.sleepPattern}
                          onChange={(e) => handleChange('sleepPattern', e.target.value)}
                          placeholder={language === 'ar' ? 'عدد ساعات النوم يومياً' : 'Hours of sleep per day'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mentalHealth">{language === 'ar' ? 'الحالة النفسية' : 'Mental health status'}</Label>
                      <Select value={formData.mentalHealth} onValueChange={(value) => handleChange('mentalHealth', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">{language === 'ar' ? 'ممتازة' : 'Excellent'}</SelectItem>
                          <SelectItem value="good">{language === 'ar' ? 'جيدة' : 'Good'}</SelectItem>
                          <SelectItem value="moderate">{language === 'ar' ? 'متوسطة' : 'Moderate'}</SelectItem>
                          <SelectItem value="stressed">{language === 'ar' ? 'متوترة' : 'Stressed'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eatingPattern">{language === 'ar' ? 'طبيعة الأكل والمواعيد' : 'Eating pattern and schedule'}</Label>
                      <Textarea
                        id="eatingPattern"
                        value={formData.eatingPattern}
                        onChange={(e) => handleChange('eatingPattern', e.target.value)}
                        placeholder={language === 'ar' ? 'اوصف نظامك الغذائي الحالي ومواعيد وجباتك...' : 'Describe your current diet and meal times...'}
                        rows={3}
                      />
                    </div>
                  </motion.div>

                  {/* Consultation Time */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'المواعيد المناسبة' : 'Preferred Time'}
                    </h3>

                    <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-2">
                        {language === 'ar' ? '📅 مواعيد العيادة:' : '📅 Clinic Hours:'}
                      </p>
                      <p className="text-sm">
                        {language === 'ar' ? 'الاثنين: 4-6 مساءً | الجمعة: 6-8 مساءً' : 'Monday: 4-6 PM | Friday: 6-8 PM'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationTime">{language === 'ar' ? 'المواعيد المناسبة للاستشارة' : 'Suitable consultation times'}</Label>
                      <Select value={formData.consultationTime} onValueChange={(value) => handleChange('consultationTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر الموعد المناسب' : 'Select preferred time'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday-4-6pm">{language === 'ar' ? 'الاثنين 4-6 مساءً' : 'Monday 4-6 PM'}</SelectItem>
                          <SelectItem value="friday-6-8pm">{language === 'ar' ? 'الجمعة 6-8 مساءً' : 'Friday 6-8 PM'}</SelectItem>
                          <SelectItem value="any">{language === 'ar' ? 'أي موعد متاح' : 'Any available time'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        language === 'ar' ? 'جاري الإرسال...' : 'Sending...'
                      ) : (
                        <>
                          <CheckCircle className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'ar'
                      ? '* بالضغط على الزر أعلاه، سيتم فتح واتساب مع رسالة معبأة مسبقاً'
                      : '* By clicking the button above, WhatsApp will open with a pre-filled message'}
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'رد سريع' : 'Quick Response'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'نرد خلال ساعات العمل' : 'We reply during working hours'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'مواعيد مرنة' : 'Flexible Scheduling'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'مواعيد تناسب جدولك' : 'Appointments that fit your schedule'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'استشارة مجانية' : 'Free Consultation'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? '15 دقيقة أولية مجاناً' : '15 minutes initial free'}
                  </p>
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