'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Credential {
  id: number;
  titleAr: string;
  titleEn: string;
  institutionAr: string;
  institutionEn: string;
  displayOrder: number;
  isActive: boolean;
}

export default function CredentialsManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    institutionAr: '',
    institutionEn: '',
    displayOrder: 0
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/cms/credentials?isActive=true');
      const data = await res.json();
      if (data.success) {
        setCredentials(data.data);
      }
    } catch (error) {
      toast.error('فشل تحميل المؤهلات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Credential) => {
    setEditingId(item.id);
    setFormData({
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      institutionAr: item.institutionAr,
      institutionEn: item.institutionEn,
      displayOrder: item.displayOrder
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const url = editingId 
        ? `/api/cms/credentials/${editingId}`
        : '/api/cms/credentials';
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingId ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ titleAr: '', titleEn: '', institutionAr: '', institutionEn: '', displayOrder: 0 });
        fetchCredentials();
      } else {
        toast.error('فشلت العملية');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/cms/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('تم الحذف بنجاح');
        fetchCredentials();
      } else {
        toast.error('فشل الحذف');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المؤهلات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ titleAr: '', titleEn: '', institutionAr: '', institutionEn: '', displayOrder: 0 });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة مؤهل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل المؤهل' : 'إضافة مؤهل جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>العنوان بالعربية *</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  placeholder="ماجستير تغذية صحية"
                />
              </div>
              <div>
                <Label>العنوان بالإنجليزية *</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Master's in Clinical Nutrition"
                />
              </div>
              <div>
                <Label>المؤسسة بالعربية *</Label>
                <Input
                  value={formData.institutionAr}
                  onChange={(e) => setFormData({ ...formData, institutionAr: e.target.value })}
                  placeholder="جامعة القاهرة"
                />
              </div>
              <div>
                <Label>المؤسسة بالإنجليزية *</Label>
                <Input
                  value={formData.institutionEn}
                  onChange={(e) => setFormData({ ...formData, institutionEn: e.target.value })}
                  placeholder="Cairo University"
                />
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {credentials.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.titleAr}</h3>
                  <p className="text-sm text-muted-foreground">{item.titleEn}</p>
                  <p className="mt-2 text-primary">{item.institutionAr}</p>
                  <p className="text-sm text-muted-foreground">{item.institutionEn}</p>
                  <p className="text-xs text-muted-foreground mt-2">ترتيب العرض: {item.displayOrder}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}