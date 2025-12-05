'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  UserCog, 
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const { data: session, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      const { authClient } = await import('@/lib/auth-client');
      await authClient.signOut();
      localStorage.removeItem('bearer_token');
      refetch();
      toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل تسجيل الخروج' : 'Sign out failed');
    }
  };

  const navLinks = [
    {
      href: '/dashboard',
      label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/patients',
      label: language === 'ar' ? 'المرضى' : 'Patients',
      icon: Users,
    },
    {
      href: '/dashboard/appointments',
      label: language === 'ar' ? 'المواعيد' : 'Appointments',
      icon: Calendar,
    },
    {
      href: '/dashboard/staff',
      label: language === 'ar' ? 'الموظفين' : 'Staff',
      icon: UserCog,
    },
    {
      href: '/dashboard/messages',
      label: language === 'ar' ? 'الرسائل' : 'Messages',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/04-1764951246816.png"
              alt="Dr. Noura Ahmed"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dr. Noura
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-72 bg-card border-${language === 'ar' ? 'l' : 'r'} border-border z-40 transform transition-transform lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/04-1764951246816.png"
              alt="Dr. Noura Ahmed"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dr. Noura Ahmed
              </h2>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'نظام إدارة العيادة' : 'Clinic Management'}
              </p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <motion.div
                  whileHover={{ x: language === 'ar' ? -5 : 5 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-semibold">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${language === 'ar' ? 'lg:mr-72' : 'lg:ml-72'} min-h-screen p-6 pt-24 lg:pt-6`}>
        {children}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
