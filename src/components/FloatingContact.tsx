'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FloatingContact() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const handleWhatsApp = () => {
    window.open('https://wa.me/201019295074', '_blank');
  };

  const handleMessenger = () => {
    window.open('https://m.me/dt.noura.ahmed', '_blank');
  };

  return (
    <div 
      className={`fixed ${isRTL ? 'left-6' : 'right-6'} bottom-6 z-50 flex flex-col gap-4`}
      dir="ltr"
    >
      {/* WhatsApp Button */}
      <motion.button
        onClick={handleWhatsApp}
        className="group relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Animated background circles */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <MessageCircle className="w-8 h-8 text-white relative z-10" />
        
        {/* Tooltip */}
        <motion.div
          className={`absolute ${isRTL ? 'right-20' : 'left-20'} top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none`}
          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          style={{ display: 'none' }}
        >
          {language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
          <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ${isRTL ? 'border-r-8 border-r-gray-900' : 'border-l-8 border-l-gray-900'}`} />
        </motion.div>
      </motion.button>

      {/* Messenger Button */}
      <motion.button
        onClick={handleMessenger}
        className="group relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Animated background circles */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        
        <Send className="w-7 h-7 text-white relative z-10" />
        
        {/* Tooltip */}
        <motion.div
          className={`absolute ${isRTL ? 'right-20' : 'left-20'} top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none`}
          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
          style={{ display: 'none' }}
        >
          {language === 'ar' ? 'تواصل عبر ماسنجر' : 'Chat on Messenger'}
          <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ${isRTL ? 'border-r-8 border-r-gray-900' : 'border-l-8 border-l-gray-900'}`} />
        </motion.div>
      </motion.button>

      {/* Pulse animation on mobile */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }
        
        @media (max-width: 768px) {
          .group:hover + .tooltip {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
