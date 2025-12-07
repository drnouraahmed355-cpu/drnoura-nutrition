'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Key, Loader2, Shield, User, Mail, Phone, Edit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StaffMember {
  id: number;
  userId: string;
  fullName: string;
  role: string;
  phone: string;
  status: string;
  email: string;
  permissions: any;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { language } = useLanguage();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<{ id: number; userId: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'staff',
    permissions: {
      canViewPatients: false,
      canEditPatients: false,
      canManageAppointments: false,
      canManageDietPlans: false,
      canViewReports: false,
    },
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/staff-login');
      return;
    }

    // Check if user is admin
    if (session?.user) {
      checkAdminRole();
    }
  }, [session, isPending, router]);

  const checkAdminRole = async () => {
    try {
      const response = await fetch('/api/auth/role', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
      });
      const data = await response.json();

      if (data.role !== 'admin') {
        toast.error(language === 'ar' ? 'غير مصرح لك بالوصول' : 'Unauthorized access');
        router.push('/dashboard');
        return;
      }

      fetchStaff();
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
      });
      const result = await response.json();
      setStaff(result.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create staff');
      }

      const password = result.data?.credentials?.password;

      toast.success(
        language === 'ar'
          ? `تم إنشاء الحساب بنجاح. كلمة المرور: ${password}`
          : `Account created successfully. Password: ${password}`,
        { duration: 10000 }
      );

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'staff',
        permissions: {
          canViewPatients: false,
          canEditPatients: false,
          canManageAppointments: false,
          canManageDietPlans: false,
          canViewReports: false,
        },
      });
      setIsDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      toast.error(error.message || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStaff = async (id: number, userId: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا المستخدم؟' : 'Delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }

      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const handleChangePassword = async () => {
    if (!editingPassword) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${editingPassword.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
      setEditingPassword(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: any = {
      admin: { color: 'bg-red-500', label: language === 'ar' ? 'مدير' : 'Admin' },
      doctor: { color: 'bg-blue-500', label: language === 'ar' ? 'طبيب' : 'Doctor' },
      nutritionist: { color: 'bg-green-500', label: language === 'ar' ? 'أخصائي تغذية' : 'Nutritionist' },
      staff: { color: 'bg-gray-500', label: language === 'ar' ? 'موظف' : 'Staff' },
    };

    const config = roleConfig[role] || roleConfig.staff;
    return <Badge className={config.color}>{config.label}</Badge>;
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة حسابات الموظفين والأطباء' : 'Manage staff and doctor accounts'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <UserPlus className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar'
                  ? 'سيتم توليد كلمة مرور تلقائياً'
                  : 'A password will be generated automatically'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  {language === 'ar' ? 'الدور الوظيفي' : 'Role'}
                </Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</SelectItem>
                    <SelectItem value="doctor">{language === 'ar' ? 'طبيب' : 'Doctor'}</SelectItem>
                    <SelectItem value="nutritionist">{language === 'ar' ? 'أخصائي تغذية' : 'Nutritionist'}</SelectItem>
                    <SelectItem value="staff">{language === 'ar' ? 'موظف استقبال' : 'Reception Staff'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</Label>
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.canViewPatients}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canViewPatients: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>{language === 'ar' ? 'عرض بيانات المرضى' : 'View Patients'}</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.canEditPatients}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canEditPatients: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>{language === 'ar' ? 'تعديل بيانات المرضى' : 'Edit Patients'}</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.canManageAppointments}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canManageAppointments: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>{language === 'ar' ? 'إدارة المواعيد' : 'Manage Appointments'}</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.canManageDietPlans}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canManageDietPlans: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>{language === 'ar' ? 'إدارة الأنظمة الغذائية' : 'Manage Diet Plans'}</span>
                    </label>
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.canViewReports}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, canViewReports: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>{language === 'ar' ? 'عرض التقارير' : 'View Reports'}</span>
                    </label>
                  </CardContent>
                </Card>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <UserPlus className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'قائمة المستخدمين' : 'Users List'}</CardTitle>
          <CardDescription>
            {language === 'ar' ? 'إجمالي المستخدمين:' : 'Total Users:'} {staff.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active'
                          ? language === 'ar'
                            ? 'نشط'
                            : 'Active'
                          : language === 'ar'
                          ? 'غير نشط'
                          : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Dialog open={editingPassword?.id === member.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingPassword(null);
                            setNewPassword('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPassword({ id: member.id, userId: member.userId, name: member.fullName })}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                              </DialogTitle>
                              <DialogDescription>
                                {language === 'ar' ? 'تغيير كلمة المرور لـ' : 'Change password for'} {member.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                                <Input
                                  type="text"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                                />
                              </div>
                              <Button
                                onClick={handleChangePassword}
                                className="w-full"
                              >
                                {language === 'ar' ? 'حفظ' : 'Save'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id, member.userId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}