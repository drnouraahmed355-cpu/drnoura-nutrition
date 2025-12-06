'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Save, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: number;
  nameAr: string;
  nameEn: string;
  textAr: string;
  textEn: string;
  rating: number;
  displayOrder: number;
  isActive: boolean;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    textAr: '',
    textEn: '',
    rating: 5,
    displayOrder: 0
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/cms/testimonials?isActive=true');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      toast.error('فشل تحميل الشهادات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setFormData({
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      textAr: item.textAr,
      textEn: item.textEn,
      rating: item.rating,
      displayOrder: item.displayOrder
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const url = editingId 
        ? `/api/cms/testimonials/${editingId}`
        : '/api/cms/testimonials';
      
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
        setFormData({ nameAr: '', nameEn: '', textAr: '', textEn: '', rating: 5, displayOrder: 0 });
        fetchTestimonials();
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
      const res = await fetch(`/api/cms/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('تم الحذف بنجاح');
        fetchTestimonials();
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
        <h2 className="text-2xl font-bold">إدارة شهادات العملاء</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ nameAr: '', nameEn: '', textAr: '', textEn: '', rating: 5, displayOrder: 0 });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة شهادة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الاسم بالعربية *</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أحمد محمد"
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية *</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Ahmed Mohamed"
                />
              </div>
              <div>
                <Label>نص الشهادة بالعربية *</Label>
                <Textarea
                  value={formData.textAr}
                  onChange={(e) => setFormData({ ...formData, textAr: e.target.value })}
                  rows={4}
                  placeholder="دكتورة نورا ساعدتني في..."
                />
              </div>
              <div>
                <Label>نص الشهادة بالإنجليزية *</Label>
                <Textarea
                  value={formData.textEn}
                  onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                  rows={4}
                  placeholder="Dr. Noura helped me..."
                />
              </div>
              <div>
                <Label>التقييم (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
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
        {testimonials.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <h3 className="font-bold">{item.nameAr}</h3>
                  <p className="text-sm text-muted-foreground">{item.nameEn}</p>
                  <p className="mt-2 text-sm">{item.textAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.textEn}</p>
                  <p className="text-xs text-muted-foreground mt-2">ترتيب: {item.displayOrder}</p>
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