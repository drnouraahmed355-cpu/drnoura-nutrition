'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Expertise {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export default function ExpertiseManager() {
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    icon: 'briefcase',
    displayOrder: 0
  });

  useEffect(() => {
    fetchExpertise();
  }, []);

  const fetchExpertise = async () => {
    try {
      const res = await fetch('/api/cms/expertise?isActive=true');
      const data = await res.json();
      if (data.success) {
        setExpertise(data.data);
      }
    } catch (error) {
      toast.error('فشل تحميل مجالات الخبرة');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Expertise) => {
    setEditingId(item.id);
    setFormData({
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      icon: item.icon,
      displayOrder: item.displayOrder
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const url = editingId 
        ? `/api/cms/expertise/${editingId}`
        : '/api/cms/expertise';
      
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
        setFormData({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', icon: 'briefcase', displayOrder: 0 });
        fetchExpertise();
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
      const res = await fetch(`/api/cms/expertise/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('تم الحذف بنجاح');
        fetchExpertise();
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
        <h2 className="text-2xl font-bold">إدارة مجالات الخبرة</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', icon: 'briefcase', displayOrder: 0 });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة مجال خبرة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل مجال الخبرة' : 'إضافة مجال خبرة جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>العنوان بالعربية *</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  placeholder="تغذية رياضية"
                />
              </div>
              <div>
                <Label>العنوان بالإنجليزية *</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Sports Nutrition"
                />
              </div>
              <div>
                <Label>الوصف بالعربية *</Label>
                <Textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3}
                  placeholder="برامج تغذية متخصصة للرياضيين..."
                />
              </div>
              <div>
                <Label>الوصف بالإنجليزية *</Label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  placeholder="Specialized nutrition programs for athletes..."
                />
              </div>
              <div>
                <Label>اسم الأيقونة</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="briefcase"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  أمثلة: briefcase, heart, activity, users, target
                </p>
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
        {expertise.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.titleAr}</h3>
                  <p className="text-sm text-muted-foreground">{item.titleEn}</p>
                  <p className="mt-2 text-sm">{item.descriptionAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.descriptionEn}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    أيقونة: {item.icon} | ترتيب: {item.displayOrder}
                  </p>
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