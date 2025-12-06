'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface SiteContent {
  id: number;
  section: string;
  key: string;
  valueAr: string;
  valueEn: string;
  updatedAt: string;
}

export default function SiteContentManager() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    section: '',
    key: '',
    valueAr: '',
    valueEn: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/cms/site-content', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      toast.error('فشل تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: SiteContent) => {
    setEditingId(item.id);
    setFormData({
      section: item.section,
      key: item.key,
      valueAr: item.valueAr,
      valueEn: item.valueEn
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/cms/site-content/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('تم التحديث بنجاح');
        setEditingId(null);
        fetchContent();
      } else {
        toast.error('فشل التحديث');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ section: '', key: '', valueAr: '', valueEn: '' });
  };

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, SiteContent[]>);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedContent).map(([section, items]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label>القسم</Label>
                      <Input
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>المفتاح</Label>
                      <Input
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>المحتوى بالعربية</Label>
                      <Textarea
                        value={formData.valueAr}
                        onChange={(e) => setFormData({ ...formData, valueAr: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>المحتوى بالإنجليزية</Label>
                      <Textarea
                        value={formData.valueEn}
                        onChange={(e) => setFormData({ ...formData, valueEn: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        حفظ
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">{item.key}</p>
                        <p className="mt-2 text-right">{item.valueAr}</p>
                        <p className="mt-1 text-muted-foreground text-sm">{item.valueEn}</p>
                      </div>
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
