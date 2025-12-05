'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Eye, Edit, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  status: string;
  createdAt: string;
}

export default function PatientsPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPatient, setNewPatient] = useState({
    nationalId: '',
    fullName: '',
    email: '',
    age: '',
    gender: 'male',
    phone: '',
    weightCurrent: '',
    height: '',
    emergencyContact: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/patients');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPatients();
    }
  }, [session]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const url = statusFilter !== 'all' 
        ? `/api/patients?status=${statusFilter}`
        : '/api/patients';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      } else {
        toast.error(language === 'ar' ? 'فشل في تحميل المرضى' : 'Failed to load patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPatient,
          age: parseInt(newPatient.age),
          weightCurrent: parseFloat(newPatient.weightCurrent),
          height: parseFloat(newPatient.height),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(
          language === 'ar' 
            ? `تم إضافة المريض بنجاح! البريد: ${result.credentials.email} | كلمة المرور: ${result.credentials.password}`
            : `Patient added! Email: ${result.credentials.email} | Password: ${result.credentials.password}`,
          { duration: 10000 }
        );
        setIsAddDialogOpen(false);
        setNewPatient({
          nationalId: '',
          fullName: '',
          email: '',
          age: '',
          gender: 'male',
          phone: '',
          weightCurrent: '',
          height: '',
          emergencyContact: '',
        });
        fetchPatients();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة المريض' : 'Failed to add patient'));
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nationalId?.includes(searchTerm) ||
    patient.phone?.includes(searchTerm)
  );

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'ar' ? 'إدارة المرضى' : 'Patient Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'عرض وإدارة سجلات المرضى' : 'View and manage patient records'}
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة مريض' : 'Add Patient'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'ar' ? 'إضافة مريض جديد' : 'Add New Patient'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الرقم القومي' : 'National ID'} *</Label>
                  <Input
                    value={newPatient.nationalId}
                    onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
                    placeholder="29012345678901"
                    required
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *</Label>
                  <Input
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</Label>
                  <Input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السن' : 'Age'}</Label>
                  <Input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الجنس' : 'Gender'}</Label>
                  <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{language === 'ar' ? 'ذكر' : 'Male'}</SelectItem>
                      <SelectItem value="female">{language === 'ar' ? 'أنثى' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newPatient.weightCurrent}
                    onChange={(e) => setNewPatient({...newPatient, weightCurrent: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الطول (سم)' : 'Height (cm)'}</Label>
                  <Input
                    type="number"
                    value={newPatient.height}
                    onChange={(e) => setNewPatient({...newPatient, height: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'جهة اتصال طوارئ' : 'Emergency Contact'}</Label>
                <Input
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                  placeholder={language === 'ar' ? 'الاسم - الصلة - رقم الهاتف' : 'Name - Relation - Phone'}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'بحث' : 'Search'}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'بحث بالاسم، الرقم القومي، الهاتف...' : 'Search by name, ID, phone...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setTimeout(() => fetchPatients(), 100);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchPatients} className="w-full">
                {language === 'ar' ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'قائمة المرضى' : 'Patients List'}
            <span className="text-sm text-muted-foreground">({filteredPatients.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا يوجد مرضى' : 'No patients found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">{patient.fullName}</h3>
                          <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{language === 'ar' ? 'الرقم القومي:' : 'National ID:'}</span>
                              <p className="font-semibold">{patient.nationalId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                              <p className="font-semibold">{patient.phone}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{language === 'ar' ? 'الوزن/الطول:' : 'Weight/Height:'}</span>
                              <p className="font-semibold">{patient.weightCurrent} kg / {patient.height} cm</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">BMI:</span>
                              <p className="font-semibold">{patient.bmi?.toFixed(1)}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              patient.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {patient.status === 'active' 
                                ? (language === 'ar' ? 'نشط' : 'Active')
                                : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <Button variant="outline" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
