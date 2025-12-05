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
import { motion } from 'framer-motion';
import { UserCog, Search, Plus, Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Staff {
  id: number;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  permissions: string[];
  createdAt: string;
}

export default function StaffPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'assistant',
    permissions: [] as string[],
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/staff');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchStaff();
    }
  }, [session, roleFilter]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const url = roleFilter !== 'all'
        ? `/api/staff?role=${roleFilter}`
        : '/api/staff';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setStaff(result.data);
      } else {
        toast.error(language === 'ar' ? 'فشل في تحميل الموظفين' : 'Failed to load staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newStaff),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          language === 'ar'
            ? `تم إضافة الموظف! البريد: ${result.data.credentials.email} | كلمة المرور: ${result.data.credentials.password}`
            : `Staff added! Email: ${result.data.credentials.email} | Password: ${result.data.credentials.password}`,
          { duration: 10000 }
        );
        setIsAddDialogOpen(false);
        setNewStaff({
          fullName: '',
          email: '',
          phone: '',
          role: 'assistant',
          permissions: [],
        });
        fetchStaff();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إضافة الموظف' : 'Failed to add staff'));
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) return null;

  const getRoleLabel = (role: string) => {
    const roles: Record<string, { ar: string; en: string }> = {
      'doctor': { ar: 'طبيب', en: 'Doctor' },
      'nutritionist': { ar: 'أخصائي تغذية', en: 'Nutritionist' },
      'assistant': { ar: 'مساعد', en: 'Assistant' },
      'admin': { ar: 'مدير', en: 'Admin' },
    };
    return language === 'ar' ? roles[role]?.ar : roles[role]?.en || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'nutritionist':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assistant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const availablePermissions = [
    { value: 'manage_patients', label: language === 'ar' ? 'إدارة المرضى' : 'Manage Patients' },
    { value: 'manage_staff', label: language === 'ar' ? 'إدارة الموظفين' : 'Manage Staff' },
    { value: 'manage_diet_plans', label: language === 'ar' ? 'إدارة خطط الدايت' : 'Manage Diet Plans' },
    { value: 'manage_appointments', label: language === 'ar' ? 'إدارة المواعيد' : 'Manage Appointments' },
    { value: 'view_analytics', label: language === 'ar' ? 'عرض التحليلات' : 'View Analytics' },
    { value: 'view_patients', label: language === 'ar' ? 'عرض المرضى' : 'View Patients' },
  ];

  const togglePermission = (permission: string) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'ar' ? 'إدارة الموظفين' : 'Staff Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة فريق العمل والصلاحيات' : 'Manage team members and permissions'}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة موظف' : 'Add Staff'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'ar' ? 'إضافة موظف جديد' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *</Label>
                  <Input
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</Label>
                  <Input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الدور الوظيفي' : 'Role'} *</Label>
                  <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">{language === 'ar' ? 'طبيب' : 'Doctor'}</SelectItem>
                      <SelectItem value="nutritionist">{language === 'ar' ? 'أخصائي تغذية' : 'Nutritionist'}</SelectItem>
                      <SelectItem value="assistant">{language === 'ar' ? 'مساعد' : 'Assistant'}</SelectItem>
                      <SelectItem value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                </Label>
                <div className="grid md:grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
                  {availablePermissions.map((permission) => (
                    <label key={permission.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaff.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {language === 'ar'
                    ? '💡 سيتم إنشاء كلمة مرور تلقائياً وإرسالها بعد الإضافة'
                    : '💡 A password will be auto-generated and displayed after creation'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
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
                  placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الدور الوظيفي' : 'Role'}</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="doctor">{language === 'ar' ? 'طبيب' : 'Doctor'}</SelectItem>
                  <SelectItem value="nutritionist">{language === 'ar' ? 'أخصائي تغذية' : 'Nutritionist'}</SelectItem>
                  <SelectItem value="assistant">{language === 'ar' ? 'مساعد' : 'Assistant'}</SelectItem>
                  <SelectItem value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchStaff} className="w-full">
                {language === 'ar' ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'قائمة الموظفين' : 'Staff List'}
            <span className="text-sm text-muted-foreground">({filteredStaff.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا يوجد موظفين' : 'No staff found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="text-xl font-bold text-white">
                                {member.fullName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">{member.fullName}</h3>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <span className="text-sm text-muted-foreground">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                              <p className="font-semibold">{member.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">{language === 'ar' ? 'الصلاحيات:' : 'Permissions:'}</span>
                              <p className="font-semibold">{member.permissions?.length || 0}</p>
                            </div>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {member.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                          </span>
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
