'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Award, Briefcase, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SiteContentManager from '@/components/cms/SiteContentManager';
import CredentialsManager from '@/components/cms/CredentialsManager';
import ExpertiseManager from '@/components/cms/ExpertiseManager';
import TestimonialsManager from '@/components/cms/TestimonialsManager';

export default function CMSDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('site-content');

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">إدارة محتوى الموقع</h1>
          <p className="text-muted-foreground">
            قم بتحرير وإدارة جميع محتويات الموقع من مكان واحد
          </p>
        </div>

        {/* Content Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-4">
            <TabsTrigger value="site-content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">محتوى الموقع</span>
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">المؤهلات</span>
            </TabsTrigger>
            <TabsTrigger value="expertise" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">مجالات الخبرة</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">الشهادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="site-content">
            <SiteContentManager />
          </TabsContent>

          <TabsContent value="credentials">
            <CredentialsManager />
          </TabsContent>

          <TabsContent value="expertise">
            <ExpertiseManager />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
