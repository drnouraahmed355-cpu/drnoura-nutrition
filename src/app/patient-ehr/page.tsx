'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2, 
  FileText, 
  User, 
  Activity, 
  Pill, 
  Calendar, 
  Image as ImageIcon,
  Download,
  LogOut,
  Lock,
  TrendingDown,
  Heart,
  Utensils
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PatientData {
  id: number;
  nationalId: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  weightCurrent: number;
  height: number;
  bmi: number;
  bodyFatPercentage: number;
  metabolismRate: number;
  medicalConditions: any;
  allergies: any;
  status: string;
}

interface Measurement {
  id: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
  bodyFat: number;
  muscleMass: number;
  measuredAt: string;
  notes: string;
}

interface DietPlan {
  id: number;
  planName: string;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  mealPlan: any;
  instructions: string;
  status: string;
  creatorName: string;
}

interface Medication {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  notes: string;
  status: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  notes: string;
  staffName: string;
}

interface VisitRecord {
  id: number;
  visitDate: string;
  weight: number;
  bloodPressure: string;
  notes: string;
  progressAssessment: string;
  nextVisitDate: string;
}

interface ProgressPhoto {
  id: number;
  photoType: string;
  photoUrl: string;
  takenAt: string;
  notes: string;
}

export default function PatientEHRPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirect if not authenticated or not patient
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/patient-login');
    }
  }, [session, isPending, router]);

  // Fetch patient EHR data
  useEffect(() => {
    if (session?.user) {
      fetchEHRData();
    }
  }, [session]);

  const fetchEHRData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/patient/ehr', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch EHR data');
      }

      const result = await response.json();
      
      if (result.success) {
        setPatientData(result.data.patient);
        setMeasurements(result.data.measurements || []);
        setDietPlans(result.data.dietPlans || []);
        setMedications(result.data.medications || []);
        setAppointments(result.data.appointments || []);
        setVisitRecords(result.data.visitRecords || []);
        setProgressPhotos(result.data.progressPhotos || []);
      }
    } catch (error) {
      console.error('Error fetching EHR:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء تحميل البيانات'
          : 'Error loading data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('bearer_token');
      await refetch();
      router.push('/');
      toast.success(
        language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully'
      );
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(
        language === 'ar'
          ? 'كلمتا المرور غير متطابقتين'
          : 'Passwords do not match'
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(
        language === 'ar'
          ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/patient/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password')
        );
        return;
      }

      toast.success(
        language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'
      );
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(
        language === 'ar' ? 'حدث خطأ' : 'An error occurred'
      );
    }
  };

  const downloadAsPDF = () => {
    window.print();
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !patientData) {
    return null;
  }

  // Prepare weight chart data
  const weightChartData = measurements.slice(0, 10).reverse().map((m) => ({
    date: new Date(m.measuredAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }),
    weight: m.weight,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {language === 'ar' ? 'ملفي الطبي' : 'My Medical Record'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' ? `مرحباً، ${patientData.fullName}` : `Welcome, ${patientData.fullName}`}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Lock className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </DialogTitle>
                    <DialogDescription>
                      {language === 'ar'
                        ? 'أدخل كلمة المرور الحالية والجديدة'
                        : 'Enter your current and new password'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">
                        {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {language === 'ar' ? 'تغيير' : 'Change'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={downloadAsPDF}>
                <Download className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </Button>
            </div>
          </div>

          {/* Patient Info Card */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </p>
                  <p className="font-semibold">{patientData.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الرقم القومي' : 'National ID'}
                  </p>
                  <p className="font-semibold" dir="ltr">{patientData.nationalId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'العمر' : 'Age'}
                  </p>
                  <p className="font-semibold">{patientData.age} {language === 'ar' ? 'سنة' : 'years'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'النوع' : 'Gender'}
                  </p>
                  <p className="font-semibold">
                    {patientData.gender === 'male'
                      ? language === 'ar' ? 'ذكر' : 'Male'
                      : language === 'ar' ? 'أنثى' : 'Female'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الوزن الحالي' : 'Current Weight'}
                  </p>
                  <p className="font-semibold">{patientData.weightCurrent} {language === 'ar' ? 'كجم' : 'kg'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الطول' : 'Height'}
                  </p>
                  <p className="font-semibold">{patientData.height} {language === 'ar' ? 'سم' : 'cm'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="font-semibold">{patientData.bmi?.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'نسبة الدهون' : 'Body Fat %'}
                  </p>
                  <p className="font-semibold">{patientData.bodyFatPercentage?.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="measurements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
              <TabsTrigger value="measurements">
                <Activity className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'القياسات' : 'Measurements'}
              </TabsTrigger>
              <TabsTrigger value="diet">
                <Utensils className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'التغذية' : 'Diet'}
              </TabsTrigger>
              <TabsTrigger value="medications">
                <Pill className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'الأدوية' : 'Medications'}
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'المواعيد' : 'Appointments'}
              </TabsTrigger>
              <TabsTrigger value="visits">
                <Heart className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'الزيارات' : 'Visits'}
              </TabsTrigger>
              <TabsTrigger value="photos">
                <ImageIcon className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'الصور' : 'Photos'}
              </TabsTrigger>
            </TabsList>

            {/* Measurements Tab */}
            <TabsContent value="measurements" className="space-y-6">
              {weightChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'تطور الوزن' : 'Weight Progress'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          name={language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'سجل القياسات' : 'Measurement Records'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {measurements.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد قياسات مسجلة' : 'No measurements recorded'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {measurements.map((measurement) => (
                        <Card key={measurement.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <p className="text-sm text-muted-foreground">
                                {new Date(measurement.measuredAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'en-US',
                                  { year: 'numeric', month: 'long', day: 'numeric' }
                                )}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الوزن' : 'Weight'}
                                </p>
                                <p className="font-semibold">{measurement.weight} kg</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الصدر' : 'Chest'}
                                </p>
                                <p className="font-semibold">{measurement.chest} cm</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الخصر' : 'Waist'}
                                </p>
                                <p className="font-semibold">{measurement.waist} cm</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الأرداف' : 'Hips'}
                                </p>
                                <p className="font-semibold">{measurement.hips} cm</p>
                              </div>
                            </div>
                            {measurement.notes && (
                              <p className="mt-4 text-sm text-muted-foreground">
                                {language === 'ar' ? 'ملاحظات: ' : 'Notes: '}
                                {measurement.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Diet Plans Tab */}
            <TabsContent value="diet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'خطط التغذية' : 'Diet Plans'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dietPlans.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد خطط تغذية' : 'No diet plans available'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {dietPlans.map((plan) => (
                        <Card key={plan.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">{plan.planName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'من الطبيب: ' : 'By: '}
                                  {plan.creatorName || (language === 'ar' ? 'غير محدد' : 'N/A')}
                                </p>
                              </div>
                              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                {plan.status === 'active'
                                  ? language === 'ar' ? 'نشط' : 'Active'
                                  : language === 'ar' ? 'منتهي' : 'Completed'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                                </p>
                                <p className="font-semibold">
                                  {new Date(plan.startDate).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US'
                                  )}
                                </p>
                              </div>
                              {plan.endDate && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                  </p>
                                  <p className="font-semibold">
                                    {new Date(plan.endDate).toLocaleDateString(
                                      language === 'ar' ? 'ar-EG' : 'en-US'
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            {plan.dailyCalories && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'السعرات اليومية' : 'Daily Calories'}
                                </p>
                                <p className="font-semibold">{plan.dailyCalories} {language === 'ar' ? 'سعر' : 'cal'}</p>
                              </div>
                            )}
                            {plan.instructions && (
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm font-semibold mb-2">
                                  {language === 'ar' ? 'التعليمات:' : 'Instructions:'}
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{plan.instructions}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'الأدوية والمكملات' : 'Medications & Supplements'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {medications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد أدوية مسجلة' : 'No medications recorded'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {medications.map((med) => (
                        <Card key={med.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">{med.medicationName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'وصفه: ' : 'Prescribed by: '}
                                  {med.prescribedBy || (language === 'ar' ? 'غير محدد' : 'N/A')}
                                </p>
                              </div>
                              <Badge variant={med.status === 'active' ? 'default' : 'secondary'}>
                                {med.status === 'active'
                                  ? language === 'ar' ? 'نشط' : 'Active'
                                  : language === 'ar' ? 'منتهي' : 'Completed'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الجرعة' : 'Dosage'}
                                </p>
                                <p className="font-semibold">{med.dosage}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'التكرار' : 'Frequency'}
                                </p>
                                <p className="font-semibold">{med.frequency}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                                </p>
                                <p className="font-semibold">
                                  {new Date(med.startDate).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US'
                                  )}
                                </p>
                              </div>
                              {med.endDate && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                  </p>
                                  <p className="font-semibold">
                                    {new Date(med.endDate).toLocaleDateString(
                                      language === 'ar' ? 'ar-EG' : 'en-US'
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            {med.notes && (
                              <p className="mt-4 text-sm text-muted-foreground">
                                {language === 'ar' ? 'ملاحظات: ' : 'Notes: '}
                                {med.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'المواعيد القادمة والسابقة' : 'Upcoming & Past Appointments'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد مواعيد مسجلة' : 'No appointments recorded'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appt) => (
                        <Card key={appt.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {new Date(appt.appointmentDate).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US',
                                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground" dir="ltr">
                                  {appt.appointmentTime}
                                </p>
                              </div>
                              <Badge>
                                {appt.status === 'scheduled'
                                  ? language === 'ar' ? 'مجدول' : 'Scheduled'
                                  : appt.status === 'completed'
                                  ? language === 'ar' ? 'مكتمل' : 'Completed'
                                  : language === 'ar' ? 'ملغي' : 'Cancelled'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'النوع' : 'Type'}
                                </p>
                                <p className="font-semibold">
                                  {appt.type === 'initial'
                                    ? language === 'ar' ? 'زيارة أولى' : 'Initial Visit'
                                    : language === 'ar' ? 'متابعة' : 'Follow-up'}
                                </p>
                              </div>
                              {appt.staffName && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'مع الطبيب' : 'With Doctor'}
                                  </p>
                                  <p className="font-semibold">{appt.staffName}</p>
                                </div>
                              )}
                              {appt.notes && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                  </p>
                                  <p className="text-sm">{appt.notes}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visit Records Tab */}
            <TabsContent value="visits" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'سجلات الزيارات' : 'Visit Records'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {visitRecords.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد زيارات مسجلة' : 'No visit records'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {visitRecords.map((visit) => (
                        <Card key={visit.id} className="border">
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-4">
                              {new Date(visit.visitDate).toLocaleDateString(
                                language === 'ar' ? 'ar-EG' : 'en-US',
                                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {visit.weight && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'الوزن' : 'Weight'}
                                  </p>
                                  <p className="font-semibold">{visit.weight} kg</p>
                                </div>
                              )}
                              {visit.bloodPressure && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'ضغط الدم' : 'Blood Pressure'}
                                  </p>
                                  <p className="font-semibold" dir="ltr">{visit.bloodPressure}</p>
                                </div>
                              )}
                            </div>
                            {visit.progressAssessment && (
                              <div className="bg-muted p-4 rounded-lg mb-4">
                                <p className="text-sm font-semibold mb-2">
                                  {language === 'ar' ? 'تقييم التقدم:' : 'Progress Assessment:'}
                                </p>
                                <p className="text-sm">{visit.progressAssessment}</p>
                              </div>
                            )}
                            {visit.notes && (
                              <div className="bg-muted p-4 rounded-lg mb-4">
                                <p className="text-sm font-semibold mb-2">
                                  {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
                                </p>
                                <p className="text-sm">{visit.notes}</p>
                              </div>
                            )}
                            {visit.nextVisitDate && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? 'الزيارة القادمة' : 'Next Visit'}
                                </p>
                                <p className="font-semibold">
                                  {new Date(visit.nextVisitDate).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US'
                                  )}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'صور التقدم' : 'Progress Photos'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressPhotos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد صور مسجلة' : 'No photos available'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {progressPhotos.map((photo) => (
                        <Card key={photo.id} className="border overflow-hidden">
                          <div className="aspect-square bg-muted relative">
                            <img
                              src={photo.photoUrl}
                              alt={`Progress photo - ${photo.photoType}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary">
                                {photo.photoType === 'front'
                                  ? language === 'ar' ? 'أمامي' : 'Front'
                                  : photo.photoType === 'side'
                                  ? language === 'ar' ? 'جانبي' : 'Side'
                                  : language === 'ar' ? 'خلفي' : 'Back'}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(photo.takenAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'en-US',
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                )}
                              </p>
                            </div>
                            {photo.notes && (
                              <p className="text-sm text-muted-foreground">{photo.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
