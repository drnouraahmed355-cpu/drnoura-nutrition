'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  User,
  Scale,
  Pill,
  Calendar,
  TrendingDown,
  Upload,
  Plus,
  Loader2,
  Activity,
  FileText,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Patient {
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
  medicalConditions: string[];
  allergies: string[];
  emergencyContact: string;
  status: string;
}

interface Measurement {
  id: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  bodyFat: number;
  measuredAt: string;
}

interface DietPlan {
  id: number;
  planName: string;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  status: string;
  staffName: string;
}

interface Medication {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function PatientDetailPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [isAddDietPlanOpen, setIsAddDietPlanOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    bodyFat: '',
    muscleMass: '',
    notes: '',
  });

  const [newDietPlan, setNewDietPlan] = useState({
    planName: '',
    startDate: '',
    endDate: '',
    dailyCalories: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    instructions: '',
  });

  const [newMedication, setNewMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    notes: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user && patientId) {
      fetchPatientData();
    }
  }, [session, patientId]);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');

      const [patientRes, measurementsRes, dietPlansRes, medicationsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/patients/${patientId}/measurements`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/patients/${patientId}/diet-plans`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/patients/${patientId}/medications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const patientData = await patientRes.json();
      const measurementsData = await measurementsRes.json();
      const dietPlansData = await dietPlansRes.json();
      const medicationsData = await medicationsRes.json();

      if (patientData.success) setPatient(patientData.data);
      if (measurementsData.success) setMeasurements(measurementsData.data);
      if (dietPlansData.success) setDietPlans(dietPlansData.data);
      if (medicationsData.success) setMedications(medicationsData.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/patients/${patientId}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: parseFloat(newMeasurement.weight),
          chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : undefined,
          waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : undefined,
          hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : undefined,
          arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : undefined,
          thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : undefined,
          bodyFat: newMeasurement.bodyFat ? parseFloat(newMeasurement.bodyFat) : undefined,
          muscleMass: newMeasurement.muscleMass ? parseFloat(newMeasurement.muscleMass) : undefined,
          notes: newMeasurement.notes || undefined,
          measuredAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إضافة القياس بنجاح' : 'Measurement added successfully');
        setIsAddMeasurementOpen(false);
        setNewMeasurement({
          weight: '',
          chest: '',
          waist: '',
          hips: '',
          arms: '',
          thighs: '',
          bodyFat: '',
          muscleMass: '',
          notes: '',
        });
        fetchPatientData();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة القياس' : 'Failed to add measurement'));
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/patients/${patientId}/diet-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: newDietPlan.planName,
          startDate: newDietPlan.startDate,
          endDate: newDietPlan.endDate || undefined,
          dailyCalories: parseInt(newDietPlan.dailyCalories),
          mealPlan: {
            breakfast: newDietPlan.breakfast.split('\\n').filter(i => i.trim()),
            lunch: newDietPlan.lunch.split('\\n').filter(i => i.trim()),
            dinner: newDietPlan.dinner.split('\\n').filter(i => i.trim()),
            snacks: newDietPlan.snacks.split('\\n').filter(i => i.trim()),
          },
          instructions: newDietPlan.instructions || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إضافة خطة الدايت بنجاح' : 'Diet plan added successfully');
        setIsAddDietPlanOpen(false);
        setNewDietPlan({
          planName: '',
          startDate: '',
          endDate: '',
          dailyCalories: '',
          breakfast: '',
          lunch: '',
          dinner: '',
          snacks: '',
          instructions: '',
        });
        fetchPatientData();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة خطة الدايت' : 'Failed to add diet plan'));
      }
    } catch (error) {
      console.error('Error adding diet plan:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/patients/${patientId}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicationName: newMedication.medicationName,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          startDate: newMedication.startDate,
          endDate: newMedication.endDate || undefined,
          prescribedBy: newMedication.prescribedBy || undefined,
          notes: newMedication.notes || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إضافة الدواء بنجاح' : 'Medication added successfully');
        setIsAddMedicationOpen(false);
        setNewMedication({
          medicationName: '',
          dosage: '',
          frequency: '',
          startDate: '',
          endDate: '',
          prescribedBy: '',
          notes: '',
        });
        fetchPatientData();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة الدواء' : 'Failed to add medication'));
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
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

  const weightData = measurements.map(m => ({
    date: new Date(m.measuredAt).toLocaleDateString(),
    weight: m.weight,
  })).reverse();

  const measurementsData = measurements.slice(0, 5).map(m => ({
    date: new Date(m.measuredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    chest: m.chest,
    waist: m.waist,
    hips: m.hips,
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/patients')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {patient.fullName}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'الرقم القومي:' : 'National ID:'} {patient.nationalId}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'السن' : 'Age'}</p>
              <p className="text-lg font-semibold">{patient.age} {language === 'ar' ? 'سنة' : 'years'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الجنس' : 'Gender'}</p>
              <p className="text-lg font-semibold">
                {patient.gender === 'male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الوزن الحالي' : 'Current Weight'}</p>
              <p className="text-lg font-semibold">{patient.weightCurrent} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الطول' : 'Height'}</p>
              <p className="text-lg font-semibold">{patient.height} cm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-lg font-semibold">{patient.bmi?.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'نسبة الدهون' : 'Body Fat %'}</p>
              <p className="text-lg font-semibold">{patient.bodyFatPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الأيض' : 'Metabolism'}</p>
              <p className="text-lg font-semibold">{patient.metabolismRate} kcal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                patient.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {patient.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
              </span>
            </div>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? 'الأمراض المزمنة' : 'Medical Conditions'}</p>
              <p className="font-semibold">{patient.medicalConditions?.join(', ') || (language === 'ar' ? 'لا يوجد' : 'None')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? 'الحساسية' : 'Allergies'}</p>
              <p className="font-semibold">{patient.allergies?.join(', ') || (language === 'ar' ? 'لا يوجد' : 'None')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="measurements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements">{language === 'ar' ? 'القياسات' : 'Measurements'}</TabsTrigger>
          <TabsTrigger value="diet">{language === 'ar' ? 'الدايت' : 'Diet Plans'}</TabsTrigger>
          <TabsTrigger value="medications">{language === 'ar' ? 'الأدوية' : 'Medications'}</TabsTrigger>
          <TabsTrigger value="progress">{language === 'ar' ? 'التقدم' : 'Progress'}</TabsTrigger>
        </TabsList>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{language === 'ar' ? 'سجل القياسات' : 'Measurements History'}</h2>
            <Dialog open={isAddMeasurementOpen} onOpenChange={setIsAddMeasurementOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة قياس' : 'Add Measurement'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إضافة قياس جديد' : 'Add New Measurement'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMeasurement} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'} *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.weight}
                        onChange={(e) => setNewMeasurement({...newMeasurement, weight: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الصدر (سم)' : 'Chest (cm)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.chest}
                        onChange={(e) => setNewMeasurement({...newMeasurement, chest: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الخصر (سم)' : 'Waist (cm)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.waist}
                        onChange={(e) => setNewMeasurement({...newMeasurement, waist: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الأرداف (سم)' : 'Hips (cm)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.hips}
                        onChange={(e) => setNewMeasurement({...newMeasurement, hips: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الذراعين (سم)' : 'Arms (cm)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.arms}
                        onChange={(e) => setNewMeasurement({...newMeasurement, arms: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الفخذين (سم)' : 'Thighs (cm)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.thighs}
                        onChange={(e) => setNewMeasurement({...newMeasurement, thighs: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'نسبة الدهون (%)' : 'Body Fat (%)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.bodyFat}
                        onChange={(e) => setNewMeasurement({...newMeasurement, bodyFat: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الكتلة العضلية (كجم)' : 'Muscle Mass (kg)'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newMeasurement.muscleMass}
                        onChange={(e) => setNewMeasurement({...newMeasurement, muscleMass: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={newMeasurement.notes}
                      onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddMeasurementOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {weightData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تطور الوزن' : 'Weight Progress'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {measurementsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'قياسات الجسم' : 'Body Measurements'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={measurementsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="chest" fill="hsl(var(--primary))" name={language === 'ar' ? 'الصدر' : 'Chest'} />
                      <Bar dataKey="waist" fill="hsl(var(--secondary))" name={language === 'ar' ? 'الخصر' : 'Waist'} />
                      <Bar dataKey="hips" fill="hsl(var(--chart-3))" name={language === 'ar' ? 'الأرداف' : 'Hips'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diet Plans Tab */}
        <TabsContent value="diet" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{language === 'ar' ? 'خطط الدايت' : 'Diet Plans'}</h2>
            <Dialog open={isAddDietPlanOpen} onOpenChange={setIsAddDietPlanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة خطة' : 'Add Plan'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إضافة خطة دايت جديدة' : 'Add New Diet Plan'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddDietPlan} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم الخطة' : 'Plan Name'} *</Label>
                      <Input
                        value={newDietPlan.planName}
                        onChange={(e) => setNewDietPlan({...newDietPlan, planName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السعرات اليومية' : 'Daily Calories'} *</Label>
                      <Input
                        type="number"
                        value={newDietPlan.dailyCalories}
                        onChange={(e) => setNewDietPlan({...newDietPlan, dailyCalories: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تاريخ البدء' : 'Start Date'} *</Label>
                      <Input
                        type="date"
                        value={newDietPlan.startDate}
                        onChange={(e) => setNewDietPlan({...newDietPlan, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                      <Input
                        type="date"
                        value={newDietPlan.endDate}
                        onChange={(e) => setNewDietPlan({...newDietPlan, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الإفطار' : 'Breakfast'} *</Label>
                    <Textarea
                      value={newDietPlan.breakfast}
                      onChange={(e) => setNewDietPlan({...newDietPlan, breakfast: e.target.value})}
                      placeholder={language === 'ar' ? 'كل وجبة في سطر منفصل' : 'Each meal on a separate line'}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الغداء' : 'Lunch'} *</Label>
                    <Textarea
                      value={newDietPlan.lunch}
                      onChange={(e) => setNewDietPlan({...newDietPlan, lunch: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'العشاء' : 'Dinner'} *</Label>
                    <Textarea
                      value={newDietPlan.dinner}
                      onChange={(e) => setNewDietPlan({...newDietPlan, dinner: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الوجبات الخفيفة' : 'Snacks'} *</Label>
                    <Textarea
                      value={newDietPlan.snacks}
                      onChange={(e) => setNewDietPlan({...newDietPlan, snacks: e.target.value})}
                      rows={2}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'التعليمات' : 'Instructions'}</Label>
                    <Textarea
                      value={newDietPlan.instructions}
                      onChange={(e) => setNewDietPlan({...newDietPlan, instructions: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDietPlanOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {dietPlans.map((plan) => (
              <Card key={plan.id} className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{plan.planName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'بواسطة' : 'By'}: {plan.staffName || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {plan.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'منتهي' : 'Completed')}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'البداية:' : 'Start:'}</span>
                      <span className="font-semibold ml-2">{plan.startDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'النهاية:' : 'End:'}</span>
                      <span className="font-semibold ml-2">{plan.endDate || (language === 'ar' ? 'مستمرة' : 'Ongoing')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'السعرات:' : 'Calories:'}</span>
                      <span className="font-semibold ml-2">{plan.dailyCalories} kcal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {dietPlans.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {language === 'ar' ? 'لا توجد خطط دايت' : 'No diet plans yet'}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{language === 'ar' ? 'الأدوية والمكملات' : 'Medications & Supplements'}</h2>
            <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة دواء' : 'Add Medication'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إضافة دواء جديد' : 'Add New Medication'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم الدواء' : 'Medication Name'} *</Label>
                      <Input
                        value={newMedication.medicationName}
                        onChange={(e) => setNewMedication({...newMedication, medicationName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الجرعة' : 'Dosage'} *</Label>
                      <Input
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="500mg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'التكرار' : 'Frequency'} *</Label>
                      <Input
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        placeholder={language === 'ar' ? 'مرتين يومياً' : 'Twice daily'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'وصفه من قبل' : 'Prescribed By'}</Label>
                      <Input
                        value={newMedication.prescribedBy}
                        onChange={(e) => setNewMedication({...newMedication, prescribedBy: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تاريخ البدء' : 'Start Date'} *</Label>
                      <Input
                        type="date"
                        value={newMedication.startDate}
                        onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                      <Input
                        type="date"
                        value={newMedication.endDate}
                        onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={newMedication.notes}
                      onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddMedicationOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {medications.map((med) => (
              <Card key={med.id} className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">{med.medicationName}</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'الجرعة:' : 'Dosage:'}</span>
                          <span className="font-semibold ml-2">{med.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'التكرار:' : 'Frequency:'}</span>
                          <span className="font-semibold ml-2">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'البداية:' : 'Start:'}</span>
                          <span className="font-semibold ml-2">{med.startDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'النهاية:' : 'End:'}</span>
                          <span className="font-semibold ml-2">{med.endDate || (language === 'ar' ? 'مستمر' : 'Ongoing')}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      med.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {med.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'منتهي' : 'Completed')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {medications.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {language === 'ar' ? 'لا توجد أدوية' : 'No medications yet'}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'صور التقدم (قبل / بعد)' : 'Progress Photos (Before / After)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                {language === 'ar' ? 'قريباً - رفع الصور' : 'Coming soon - Photo upload'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
