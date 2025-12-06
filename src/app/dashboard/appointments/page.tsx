'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  patientId: number;
  patientFullName: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  notes: string;
  durationMinutes: number;
}

interface Patient {
  id: number;
  fullName: string;
}

export default function AppointmentsPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'follow-up',
    durationMinutes: '30',
    notes: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/appointments');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
      fetchPatients();
    }
  }, [session, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const url = statusFilter !== 'all'
        ? `/api/appointments?status=${statusFilter}`
        : '/api/appointments';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAppointments(result.data);
      } else {
        toast.error(language === 'ar' ? 'فشل في تحميل المواعيد' : 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: parseInt(newAppointment.patientId),
          appointmentDate: newAppointment.appointmentDate,
          appointmentTime: newAppointment.appointmentTime,
          type: newAppointment.type,
          durationMinutes: parseInt(newAppointment.durationMinutes),
          notes: newAppointment.notes || undefined,
          status: 'scheduled',
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إضافة الموعد بنجاح' : 'Appointment added successfully');
        setIsAddDialogOpen(false);
        setNewAppointment({
          patientId: '',
          appointmentDate: '',
          appointmentTime: '',
          type: 'follow-up',
          durationMinutes: '30',
          notes: '',
        });
        fetchAppointments();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة الموعد' : 'Failed to add appointment'));
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled');
        fetchAppointments();
      } else {
        toast.error(language === 'ar' ? 'فشل في إلغاء الموعد' : 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'no-show':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { ar: string; en: string }> = {
      'initial': { ar: 'استشارة أولية', en: 'Initial Consultation' },
      'follow-up': { ar: 'متابعة دورية', en: 'Follow-up' },
      'consultation': { ar: 'استشارة', en: 'Consultation' },
    };
    return language === 'ar' ? types[type]?.ar : types[type]?.en || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { ar: string; en: string }> = {
      'scheduled': { ar: 'مجدول', en: 'Scheduled' },
      'completed': { ar: 'مكتمل', en: 'Completed' },
      'cancelled': { ar: 'ملغى', en: 'Cancelled' },
      'no-show': { ar: 'لم يحضر', en: 'No Show' },
    };
    return language === 'ar' ? statuses[status]?.ar : statuses[status]?.en || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'ar' ? 'إدارة المواعيد' : 'Appointments Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'جدولة ومتابعة المواعيد' : 'Schedule and track appointments'}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة موعد' : 'Add Appointment'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'ar' ? 'إضافة موعد جديد' : 'Add New Appointment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'المريض' : 'Patient'} *</Label>
                <Select value={newAppointment.patientId} onValueChange={(value) => setNewAppointment({...newAppointment, patientId: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ar' ? 'اختر المريض' : 'Select patient'} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'التاريخ' : 'Date'} *</Label>
                  <Input
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوقت' : 'Time'} *</Label>
                  <Input
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نوع الموعد' : 'Type'} *</Label>
                  <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">{language === 'ar' ? 'استشارة أولية' : 'Initial Consultation'}</SelectItem>
                      <SelectItem value="follow-up">{language === 'ar' ? 'متابعة دورية' : 'Follow-up'}</SelectItem>
                      <SelectItem value="consultation">{language === 'ar' ? 'استشارة' : 'Consultation'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المدة (دقيقة)' : 'Duration (min)'}</Label>
                  <Input
                    type="number"
                    value={newAppointment.durationMinutes}
                    onChange={(e) => setNewAppointment({...newAppointment, durationMinutes: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                  {language === 'ar' ? 'حجز' : 'Book'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>{language === 'ar' ? 'تصفية حسب الحالة' : 'Filter by Status'}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="scheduled">{language === 'ar' ? 'مجدول' : 'Scheduled'}</SelectItem>
                <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                <SelectItem value="cancelled">{language === 'ar' ? 'ملغى' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'قائمة المواعيد' : 'Appointments List'}
            <span className="text-sm text-muted-foreground">({appointments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            {getStatusIcon(appointment.status)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{appointment.patientFullName}</h3>
                            <div className="flex flex-wrap gap-4 text-sm mt-1">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {appointment.appointmentDate}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {appointment.appointmentTime}
                              </span>
                              <span className="text-muted-foreground">
                                ({appointment.durationMinutes} {language === 'ar' ? 'دقيقة' : 'min'})
                              </span>
                            </div>
                            <p className="text-sm mt-1 text-muted-foreground">{getTypeLabel(appointment.type)}</p>
                            {appointment.notes && (
                              <p className="text-sm mt-2 text-muted-foreground italic">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                          {appointment.status === 'scheduled' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Button>
                          )}
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