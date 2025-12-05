'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Inbox, Mail, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  senderName?: string;
  receiverName?: string;
}

interface Patient {
  id: number;
  userId: string;
  fullName: string;
}

export default function MessagesPage() {
  const { language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/messages');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchPatients();
    }
  }, [session]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');

      const [sentRes, receivedRes] = await Promise.all([
        fetch(`/api/messages?type=sent`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/messages?type=received`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const sentData = await sentRes.json();
      const receivedData = await receivedRes.json();

      if (sentData.success) setSentMessages(sentData.data);
      if (receivedData.success) setReceivedMessages(receivedData.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل الرسائل' : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(language === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
        setIsComposeDialogOpen(false);
        setNewMessage({
          receiverId: '',
          subject: '',
          message: '',
        });
        fetchMessages();
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'ar' ? 'الرسائل' : 'Messages'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'التواصل مع المرضى' : 'Communicate with patients'}
          </p>
        </div>

        <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'رسالة جديدة' : 'New Message'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {language === 'ar' ? 'إنشاء رسالة جديدة' : 'Compose New Message'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'إلى' : 'To'} *</Label>
                <Select value={newMessage.receiverId} onValueChange={(value) => setNewMessage({...newMessage, receiverId: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ar' ? 'اختر المستلم' : 'Select recipient'} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.userId}>
                        {patient.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الموضوع' : 'Subject'}</Label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  placeholder={language === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الرسالة' : 'Message'} *</Label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {language === 'ar' ? 'إرسال' : 'Send'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="received">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received" className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                {language === 'ar' ? 'الواردة' : 'Inbox'}
                {receivedMessages.filter(m => !m.read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {receivedMessages.filter(m => !m.read).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {language === 'ar' ? 'المرسلة' : 'Sent'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-6 space-y-4">
              {receivedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'لا توجد رسائل واردة' : 'No received messages'}
                  </p>
                </div>
              ) : (
                receivedMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                        !message.read ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                      }`}
                      onClick={() => {
                        if (!message.read) markAsRead(message.id);
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!message.read && (
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              )}
                              <h3 className="font-bold">{message.senderName || language === 'ar' ? 'مرسل غير معروف' : 'Unknown sender'}</h3>
                            </div>
                            {message.subject && (
                              <p className="text-sm font-semibold text-muted-foreground mb-2">{message.subject}</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {new Date(message.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-6 space-y-4">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'لا توجد رسائل مرسلة' : 'No sent messages'}
                  </p>
                </div>
              ) : (
                sentMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/30">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold mb-1">
                              {language === 'ar' ? 'إلى:' : 'To:'} {message.senderName || language === 'ar' ? 'مستلم غير معروف' : 'Unknown recipient'}
                            </h3>
                            {message.subject && (
                              <p className="text-sm font-semibold text-muted-foreground mb-2">{message.subject}</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {new Date(message.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
