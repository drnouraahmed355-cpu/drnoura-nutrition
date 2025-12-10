'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Utensils,
  Flame,
  Droplets,
  Pill,
  BookOpen,
  RefreshCw,
  Sun,
  Coffee,
  Moon,
  Apple,
  Download,
  Save,
  Scale,
  Activity,
  Target,
  AlertCircle,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: number;
  nationalId: string;
  fullName: string;
  age: number;
  gender: string;
  weightCurrent: number;
  height: number;
  medicalConditions: string[];
  allergies: string[];
}

interface MealOption {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  patientInfo: {
    name: string;
    age: number;
    weight: number;
    height: number;
    bmi: number;
    goal: { ar: string; en: string };
    activityLevel: { ar: string; en: string };
  };
  calculations: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  mealPlan: {
    breakfast: MealOption[];
    morningSnack: MealOption[];
    lunch: MealOption[];
    eveningSnack: MealOption[];
    dinner: MealOption[];
  };
  beverages: {
    waterRecommendation: string;
    waterRecommendationEn: string;
    allowed: { name: string; nameEn: string; quantity: string; quantityEn: string }[];
    forbidden: { name: string; nameEn: string }[];
  };
  supplements: {
    recommended: { name: string; nameEn: string; dosage: string; dosageEn: string; timing: string; timingEn: string; note: string; noteEn: string }[];
    disclaimer: string;
    disclaimerEn: string;
  };
  guidelines: { category: string; categoryEn: string; tips: string[]; tipsEn: string[] }[];
  alternatives: {
    protein: { original: string; originalEn: string; alternatives: string[]; alternativesEn: string[] }[];
    carbs: { original: string; originalEn: string; alternatives: string[]; alternativesEn: string[] }[];
    fats: { original: string; originalEn: string; alternatives: string[]; alternativesEn: string[] }[];
  };
  generatedAt: string;
}

export default function GenerateDietPlanPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const [formData, setFormData] = useState({
    goal: 'weight_loss',
    activityLevel: 'moderate',
    allergies: '',
    dislikedFoods: '',
    healthConditions: '',
    dietaryRestrictions: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user && patientId) {
      fetchPatient();
    }
  }, [session, patientId]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setPatient(result.data);
        if (result.data.allergies?.length) {
          setFormData(prev => ({
            ...prev,
            allergies: result.data.allergies.join(', '),
          }));
        }
        if (result.data.medicalConditions?.length) {
          setFormData(prev => ({
            ...prev,
            healthConditions: result.data.medicalConditions.join(', '),
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل بيانات المريض' : 'Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!patient) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/generate-diet-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: patient.fullName,
          age: patient.age,
          weight: patient.weightCurrent,
          height: patient.height,
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
          dislikedFoods: formData.dislikedFoods.split(',').map(s => s.trim()).filter(Boolean),
          healthConditions: formData.healthConditions.split(',').map(s => s.trim()).filter(Boolean),
          dietaryRestrictions: formData.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDietPlan(result.data);
        toast.success(language === 'ar' ? 'تم إنشاء الخطة الغذائية بنجاح!' : 'Diet plan generated successfully!');
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إنشاء الخطة' : 'Failed to generate plan'));
      }
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!dietPlan || !patient) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/patients/${patientId}/diet-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: `${language === 'ar' ? 'خطة غذائية' : 'Diet Plan'} - ${new Date().toLocaleDateString()}`,
          startDate: new Date().toISOString().split('T')[0],
          dailyCalories: dietPlan.calculations.targetCalories,
          mealPlan: dietPlan.mealPlan,
          instructions: JSON.stringify({
            beverages: dietPlan.beverages,
            supplements: dietPlan.supplements,
            guidelines: dietPlan.guidelines,
            alternatives: dietPlan.alternatives,
          }),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم حفظ الخطة الغذائية!' : 'Diet plan saved!');
        router.push(`/dashboard/patients/${patientId}`);
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في حفظ الخطة' : 'Failed to save plan'));
      }
    } catch (error) {
      console.error('Error saving diet plan:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/patients/${patientId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {language === 'ar' ? 'إنشاء خطة غذائية مرنة' : 'Generate Flexible Diet Plan'}
            </h1>
            <p className="text-muted-foreground">
              {patient.fullName} - {language === 'ar' ? 'الوزن:' : 'Weight:'} {patient.weightCurrent} kg | {language === 'ar' ? 'الطول:' : 'Height:'} {patient.height} cm
            </p>
          </div>
        </div>
      </div>

      {!dietPlan ? (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'بيانات إنشاء الخطة' : 'Plan Generation Data'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'أدخل بيانات الحالة لإنشاء خطة غذائية مخصصة' : 'Enter case data to generate a customized diet plan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الهدف الأساسي' : 'Primary Goal'} *</Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData({...formData, goal: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">{language === 'ar' ? 'إنقاص الوزن' : 'Weight Loss'}</SelectItem>
                    <SelectItem value="muscle_gain">{language === 'ar' ? 'زيادة العضلات' : 'Muscle Gain'}</SelectItem>
                    <SelectItem value="maintain">{language === 'ar' ? 'تثبيت الوزن' : 'Weight Maintenance'}</SelectItem>
                    <SelectItem value="health">{language === 'ar' ? 'صحة عامة' : 'General Health'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'مستوى النشاط' : 'Activity Level'} *</Label>
                <Select value={formData.activityLevel} onValueChange={(value) => setFormData({...formData, activityLevel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">{language === 'ar' ? 'خامل (بدون نشاط)' : 'Sedentary'}</SelectItem>
                    <SelectItem value="light">{language === 'ar' ? 'نشاط قليل' : 'Light Activity'}</SelectItem>
                    <SelectItem value="moderate">{language === 'ar' ? 'نشاط متوسط (3 مرات رياضة أسبوعياً)' : 'Moderate (3x weekly exercise)'}</SelectItem>
                    <SelectItem value="high">{language === 'ar' ? 'نشاط مرتفع' : 'High Activity'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحساسيات والممنوعات' : 'Allergies & Restrictions'}</Label>
              <Textarea
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                placeholder={language === 'ar' ? 'مثال: حساسية من منتجات الألبان، نباتي، لا أحب المأكولات البحرية (فصل بفاصلة)' : 'Example: dairy allergy, vegetarian, no seafood (comma separated)'}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الأطعمة المكروهة' : 'Disliked Foods'}</Label>
              <Input
                value={formData.dislikedFoods}
                onChange={(e) => setFormData({...formData, dislikedFoods: e.target.value})}
                placeholder={language === 'ar' ? 'أطعمة لا يفضلها المريض (فصل بفاصلة)' : 'Foods the patient dislikes (comma separated)'}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة الصحية' : 'Health Conditions'}</Label>
              <Textarea
                value={formData.healthConditions}
                onChange={(e) => setFormData({...formData, healthConditions: e.target.value})}
                placeholder={language === 'ar' ? 'مثال: سكري، ضغط، كوليسترول، حموضة (فصل بفاصلة)' : 'Example: diabetes, hypertension, cholesterol, acidity (comma separated)'}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'قيود غذائية أخرى' : 'Other Dietary Restrictions'}</Label>
              <Input
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({...formData, dietaryRestrictions: e.target.value})}
                placeholder={language === 'ar' ? 'قيود دينية أو شخصية (فصل بفاصلة)' : 'Religious or personal restrictions (comma separated)'}
              />
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Utensils className="w-5 h-5 mr-2" />
              )}
              {language === 'ar' ? 'إنشاء الخطة الغذائية المرنة' : 'Generate Flexible Diet Plan'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500 rounded-full">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {language === 'ar' ? 'تم إنشاء الخطة الغذائية بنجاح!' : 'Diet Plan Generated Successfully!'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? `السعرات اليومية المستهدفة: ${dietPlan.calculations.targetCalories} سعرة` : `Target daily calories: ${dietPlan.calculations.targetCalories} kcal`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDietPlan(null)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'إعادة إنشاء' : 'Regenerate'}
                  </Button>
                  <Button onClick={handleSavePlan} disabled={isSaving} className="bg-gradient-to-r from-primary to-secondary">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {language === 'ar' ? 'حفظ الخطة' : 'Save Plan'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Scale className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'مؤشر BMI' : 'BMI'}</p>
                <p className="text-2xl font-bold">{dietPlan.patientInfo.bmi}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'السعرات اليومية' : 'Daily Calories'}</p>
                <p className="text-2xl font-bold">{dietPlan.calculations.targetCalories}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'معدل الأيض' : 'BMR'}</p>
                <p className="text-2xl font-bold">{dietPlan.calculations.bmr}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الهدف' : 'Goal'}</p>
                <p className="text-lg font-bold">{language === 'ar' ? dietPlan.patientInfo.goal.ar : dietPlan.patientInfo.goal.en}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'توزيع المغذيات الكبرى' : 'Macronutrients Distribution'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-950/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'بروتين' : 'Protein'}</p>
                  <p className="text-2xl font-bold text-red-600">{dietPlan.calculations.macros.protein}g</p>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'كربوهيدرات' : 'Carbs'}</p>
                  <p className="text-2xl font-bold text-yellow-600">{dietPlan.calculations.macros.carbs}g</p>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'دهون' : 'Fat'}</p>
                  <p className="text-2xl font-bold text-blue-600">{dietPlan.calculations.macros.fat}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="meals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="meals"><Utensils className="w-4 h-4 mr-1" /> {language === 'ar' ? 'الوجبات' : 'Meals'}</TabsTrigger>
              <TabsTrigger value="beverages"><Droplets className="w-4 h-4 mr-1" /> {language === 'ar' ? 'المشروبات' : 'Beverages'}</TabsTrigger>
              <TabsTrigger value="supplements"><Pill className="w-4 h-4 mr-1" /> {language === 'ar' ? 'المكملات' : 'Supplements'}</TabsTrigger>
              <TabsTrigger value="guidelines"><BookOpen className="w-4 h-4 mr-1" /> {language === 'ar' ? 'الإرشادات' : 'Guidelines'}</TabsTrigger>
              <TabsTrigger value="alternatives"><RefreshCw className="w-4 h-4 mr-1" /> {language === 'ar' ? 'البدائل' : 'Alternatives'}</TabsTrigger>
            </TabsList>

            <TabsContent value="meals" className="space-y-4">
              <MealSection
                title={language === 'ar' ? '☀️ الفطار' : '☀️ Breakfast'}
                options={dietPlan.mealPlan.breakfast}
                language={language}
                icon={<Sun className="w-5 h-5 text-yellow-500" />}
              />
              <MealSection
                title={language === 'ar' ? '🍏 سناك صباحي' : '🍏 Morning Snack'}
                options={dietPlan.mealPlan.morningSnack}
                language={language}
                icon={<Apple className="w-5 h-5 text-green-500" />}
              />
              <MealSection
                title={language === 'ar' ? '🍽️ الغداء' : '🍽️ Lunch'}
                options={dietPlan.mealPlan.lunch}
                language={language}
                icon={<Utensils className="w-5 h-5 text-orange-500" />}
              />
              <MealSection
                title={language === 'ar' ? '🥜 سناك مسائي' : '🥜 Evening Snack'}
                options={dietPlan.mealPlan.eveningSnack}
                language={language}
                icon={<Coffee className="w-5 h-5 text-amber-600" />}
              />
              <MealSection
                title={language === 'ar' ? '🌙 العشاء' : '🌙 Dinner'}
                options={dietPlan.mealPlan.dinner}
                language={language}
                icon={<Moon className="w-5 h-5 text-indigo-500" />}
              />
            </TabsContent>

            <TabsContent value="beverages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    {language === 'ar' ? 'المشروبات والترطيب' : 'Beverages & Hydration'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                    <p className="font-bold text-lg text-blue-700 dark:text-blue-300">
                      💧 {language === 'ar' ? 'الماء:' : 'Water:'} {language === 'ar' ? dietPlan.beverages.waterRecommendation : dietPlan.beverages.waterRecommendationEn}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3 text-green-600">{language === 'ar' ? '✅ المشروبات المسموحة' : '✅ Allowed Beverages'}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {dietPlan.beverages.allowed.map((item, index) => (
                        <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <p className="font-semibold">{language === 'ar' ? item.name : item.nameEn}</p>
                          <p className="text-sm text-muted-foreground">{language === 'ar' ? item.quantity : item.quantityEn}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3 text-red-600">{language === 'ar' ? '❌ المشروبات الممنوعة' : '❌ Forbidden Beverages'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {dietPlan.beverages.forbidden.map((item, index) => (
                        <Badge key={index} variant="destructive">
                          {language === 'ar' ? item.name : item.nameEn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-500" />
                    {language === 'ar' ? 'الفيتامينات والمكملات' : 'Vitamins & Supplements'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dietPlan.supplements.recommended.map((supp, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{language === 'ar' ? supp.name : supp.nameEn}</h4>
                          <p className="text-sm text-muted-foreground">{language === 'ar' ? supp.dosage : supp.dosageEn}</p>
                        </div>
                        <Badge variant="secondary">{language === 'ar' ? supp.timing : supp.timingEn}</Badge>
                      </div>
                      <p className="text-sm mt-2 text-blue-600">{language === 'ar' ? supp.note : supp.noteEn}</p>
                    </div>
                  ))}
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{language === 'ar' ? dietPlan.supplements.disclaimer : dietPlan.supplements.disclaimerEn}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guidelines">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    {language === 'ar' ? 'إرشادات عامة هامة' : 'Important Guidelines'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dietPlan.guidelines.map((guideline, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-lg mb-3">{language === 'ar' ? guideline.category : guideline.categoryEn}</h4>
                      <ul className="space-y-2">
                        {(language === 'ar' ? guideline.tips : guideline.tipsEn).map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alternatives">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-500" />
                    {language === 'ar' ? 'بدائل الأطعمة' : 'Food Alternatives'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AlternativesSection
                    title={language === 'ar' ? 'بدائل البروتين' : 'Protein Alternatives'}
                    items={dietPlan.alternatives.protein}
                    language={language}
                  />
                  <AlternativesSection
                    title={language === 'ar' ? 'بدائل الكربوهيدرات' : 'Carbs Alternatives'}
                    items={dietPlan.alternatives.carbs}
                    language={language}
                  />
                  <AlternativesSection
                    title={language === 'ar' ? 'بدائل الدهون' : 'Fat Alternatives'}
                    items={dietPlan.alternatives.fats}
                    language={language}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function MealSection({ title, options, language, icon }: { title: string; options: MealOption[]; language: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="outline" className="ml-2">{language === 'ar' ? 'اختر خياراً واحداً' : 'Choose one option'}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border-2 rounded-lg hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg">
                    {language === 'ar' ? `الخيار ${index + 1}: ` : `Option ${index + 1}: `}
                    {language === 'ar' ? option.name : option.nameEn}
                  </h4>
                  <p className="text-muted-foreground">{language === 'ar' ? option.description : option.descriptionEn}</p>
                </div>
                <Badge className="bg-orange-500">{option.calories} {language === 'ar' ? 'سعرة' : 'kcal'}</Badge>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-red-600">{language === 'ar' ? 'بروتين:' : 'P:'} {option.protein}g</span>
                <span className="text-yellow-600">{language === 'ar' ? 'كارب:' : 'C:'} {option.carbs}g</span>
                <span className="text-blue-600">{language === 'ar' ? 'دهون:' : 'F:'} {option.fat}g</span>
              </div>
              {index < options.length - 1 && (
                <div className="text-center mt-3 text-muted-foreground font-semibold">
                  {language === 'ar' ? '— أو —' : '— OR —'}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AlternativesSection({ title, items, language }: { title: string; items: { original: string; originalEn: string; alternatives: string[]; alternativesEn: string[] }[]; language: string }) {
  return (
    <div>
      <h4 className="font-bold text-lg mb-3">{title}</h4>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-muted/50 rounded-lg">
            <span className="font-semibold">{language === 'ar' ? item.original : item.originalEn}</span>
            <span className="mx-2">→</span>
            <span className="text-muted-foreground">
              {(language === 'ar' ? item.alternatives : item.alternativesEn).join(' / ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
