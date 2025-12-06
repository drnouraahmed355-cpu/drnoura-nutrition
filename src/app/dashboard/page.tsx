'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  patients: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  staff: {
    total: number;
  };
  visits: {
    total: number;
  };
  recentActivity: {
    newPatients: number;
    completedAppointments: number;
    totalVisits: number;
  };
}

export default function DashboardPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error(language === 'ar' ? 'فشل في تحميل الإحصائيات' : 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !stats) return null;

  const statCards = [
    {
      icon: Users,
      label: language === 'ar' ? 'إجمالي المرضى' : 'Total Patients',
      value: stats.patients.total,
      subValue: `${stats.patients.active} ${language === 'ar' ? 'نشط' : 'active'}`,
      color: 'from-primary to-primary/70',
      link: '/dashboard/patients',
    },
    {
      icon: Calendar,
      label: language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments',
      value: stats.appointments.upcoming,
      subValue: `${stats.appointments.total} ${language === 'ar' ? 'إجمالي' : 'total'}`,
      color: 'from-blue-500 to-blue-400',
      link: '/dashboard/appointments',
    },
    {
      icon: CheckCircle,
      label: language === 'ar' ? 'المواعيد المكتملة' : 'Completed Appointments',
      value: stats.appointments.completed,
      subValue: language === 'ar' ? 'هذا الشهر' : 'this month',
      color: 'from-green-500 to-green-400',
      link: '/dashboard/appointments',
    },
    {
      icon: Activity,
      label: language === 'ar' ? 'إجمالي الزيارات' : 'Total Visits',
      value: stats.visits.total,
      subValue: `${stats.recentActivity.totalVisits} ${language === 'ar' ? 'آخر 7 أيام' : 'last 7 days'}`,
      color: 'from-secondary to-secondary/70',
      link: '/dashboard/patients',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ar' ? 'مرحباً' : 'Welcome'}, {session.user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'هذه لوحة التحكم الخاصة بك لإدارة المرضى والمواعيد'
                : 'This is your dashboard to manage patients and appointments'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href={stat.link}>
              <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'النشاط الأخير (7 أيام)' : 'Recent Activity (7 days)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">{language === 'ar' ? 'مرضى جدد' : 'New Patients'}</span>
              </div>
              <span className="text-2xl font-bold">{stats.recentActivity.newPatients}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">{language === 'ar' ? 'مواعيد مكتملة' : 'Completed Appointments'}</span>
              </div>
              <span className="text-2xl font-bold">{stats.recentActivity.completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-secondary" />
                <span className="font-medium">{language === 'ar' ? 'زيارات' : 'Visits'}</span>
              </div>
              <span className="text-2xl font-bold">{stats.recentActivity.totalVisits}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'إحصائيات المواعيد' : 'Appointment Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{language === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}</span>
                <span className="text-xl font-bold">{stats.appointments.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <p className="text-2xl font-bold">{stats.appointments.upcoming}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'قادم' : 'Upcoming'}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <p className="text-2xl font-bold">{stats.appointments.completed}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                </div>
                <p className="text-2xl font-bold">{stats.appointments.cancelled}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'ملغى' : 'Cancelled'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <Link href="/dashboard/patients">
              <Button variant="outline" className="w-full h-20">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{language === 'ar' ? 'إدارة المرضى' : 'Manage Patients'}</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/appointments">
              <Button variant="outline" className="w-full h-20">
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{language === 'ar' ? 'عرض المواعيد' : 'View Appointments'}</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/staff">
              <Button variant="outline" className="w-full h-20">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{language === 'ar' ? 'إدارة الموظفين' : 'Manage Staff'}</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full h-20">
                <div className="text-center">
                  <Activity className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{language === 'ar' ? 'الرسائل' : 'Messages'}</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/cms">
              <Button variant="outline" className="w-full h-20 border-primary/30 hover:border-primary">
                <div className="text-center">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-semibold">{language === 'ar' ? 'إدارة المحتوى' : 'Content Manager'}</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}