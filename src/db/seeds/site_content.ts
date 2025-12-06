import { db } from '@/db';
import { siteContent } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleSiteContent = [
        // Hero Section (5 records)
        {
            section: 'hero',
            key: 'title',
            valueAr: 'د. نورا أحمد - أخصائية تغذية علاجية',
            valueEn: 'Dr. Noura Ahmed - Clinical Nutritionist',
            updatedAt: currentTimestamp,
        },
        {
            section: 'hero',
            key: 'subtitle',
            valueAr: 'خبيرة في التغذية الصحية والعلاجية',
            valueEn: 'Expert in Clinical and Therapeutic Nutrition',
            updatedAt: currentTimestamp,
        },
        {
            section: 'hero',
            key: 'description',
            valueAr: 'أكثر من 10 سنوات خبرة في مجال التغذية العلاجية والرياضية. متخصصة في علاج السمنة والأمراض المزمنة من خلال التغذية الصحية المتوازنة.',
            valueEn: 'Over 10 years of experience in clinical and sports nutrition. Specialized in treating obesity and chronic diseases through balanced healthy nutrition.',
            updatedAt: currentTimestamp,
        },
        {
            section: 'hero',
            key: 'cta_text',
            valueAr: 'احجز استشارتك الآن',
            valueEn: 'Book Your Consultation Now',
            updatedAt: currentTimestamp,
        },
        {
            section: 'hero',
            key: 'cta_secondary',
            valueAr: 'تعرف على خدماتنا',
            valueEn: 'Learn About Our Services',
            updatedAt: currentTimestamp,
        },

        // About Section (5 records)
        {
            section: 'about',
            key: 'title',
            valueAr: 'من أنا',
            valueEn: 'About Me',
            updatedAt: currentTimestamp,
        },
        {
            section: 'about',
            key: 'intro',
            valueAr: 'د. نورا أحمد، أخصائية تغذية علاجية معتمدة مع خبرة تزيد عن 10 سنوات في مجال التغذية الصحية والعلاجية',
            valueEn: 'Dr. Noura Ahmed, certified clinical nutritionist with over 10 years of experience in clinical and therapeutic nutrition',
            updatedAt: currentTimestamp,
        },
        {
            section: 'about',
            key: 'description',
            valueAr: 'متخصصة في وضع برامج غذائية مخصصة لكل حالة، مع متابعة دقيقة وشاملة لتحقيق النتائج المرجوة. أؤمن بأن التغذية الصحية هي أساس الحياة السليمة والوقاية من الأمراض.',
            valueEn: 'Specialized in creating customized nutrition programs for each case, with precise and comprehensive follow-up to achieve desired results. I believe that healthy nutrition is the foundation of a healthy life and disease prevention.',
            updatedAt: currentTimestamp,
        },
        {
            section: 'about',
            key: 'experience_years',
            valueAr: '10+ سنوات خبرة',
            valueEn: '10+ Years Experience',
            updatedAt: currentTimestamp,
        },
        {
            section: 'about',
            key: 'patients_helped',
            valueAr: '1500+ مريض ناجح',
            valueEn: '1500+ Successful Patients',
            updatedAt: currentTimestamp,
        },

        // Services Section (5 records)
        {
            section: 'services',
            key: 'title',
            valueAr: 'خدماتنا',
            valueEn: 'Our Services',
            updatedAt: currentTimestamp,
        },
        {
            section: 'services',
            key: 'subtitle',
            valueAr: 'برامج تغذية شاملة مصممة خصيصاً لتلبية احتياجاتك',
            valueEn: 'Comprehensive nutrition programs designed specifically to meet your needs',
            updatedAt: currentTimestamp,
        },
        {
            section: 'services',
            key: 'online_consultation',
            valueAr: 'استشارات أونلاين متاحة',
            valueEn: 'Online Consultations Available',
            updatedAt: currentTimestamp,
        },
        {
            section: 'services',
            key: 'personalized_plans',
            valueAr: 'خطط غذائية مخصصة',
            valueEn: 'Personalized Nutrition Plans',
            updatedAt: currentTimestamp,
        },
        {
            section: 'services',
            key: 'follow_up',
            valueAr: 'متابعة دورية شاملة',
            valueEn: 'Comprehensive Regular Follow-up',
            updatedAt: currentTimestamp,
        },

        // Contact Section (5 records)
        {
            section: 'contact',
            key: 'title',
            valueAr: 'تواصل معنا',
            valueEn: 'Contact Us',
            updatedAt: currentTimestamp,
        },
        {
            section: 'contact',
            key: 'phone',
            valueAr: '+20 123 456 7890',
            valueEn: '+20 123 456 7890',
            updatedAt: currentTimestamp,
        },
        {
            section: 'contact',
            key: 'email',
            valueAr: 'info@drnoura.com',
            valueEn: 'info@drnoura.com',
            updatedAt: currentTimestamp,
        },
        {
            section: 'contact',
            key: 'address',
            valueAr: 'القاهرة، مصر - متاح للاستشارات الأونلاين في جميع أنحاء العالم',
            valueEn: 'Cairo, Egypt - Available for online consultations worldwide',
            updatedAt: currentTimestamp,
        },
        {
            section: 'contact',
            key: 'working_hours',
            valueAr: 'السبت - الخميس: 9 صباحاً - 8 مساءً',
            valueEn: 'Saturday - Thursday: 9 AM - 8 PM',
            updatedAt: currentTimestamp,
        },

        // Footer Section (5 records)
        {
            section: 'footer',
            key: 'about_text',
            valueAr: 'د. نورا أحمد - أخصائية تغذية علاجية معتمدة تساعدك على تحقيق أهدافك الصحية من خلال برامج غذائية مخصصة ومتابعة شاملة',
            valueEn: 'Dr. Noura Ahmed - Certified clinical nutritionist helping you achieve your health goals through customized nutrition programs and comprehensive follow-up',
            updatedAt: currentTimestamp,
        },
        {
            section: 'footer',
            key: 'quick_links_title',
            valueAr: 'روابط سريعة',
            valueEn: 'Quick Links',
            updatedAt: currentTimestamp,
        },
        {
            section: 'footer',
            key: 'services_link',
            valueAr: 'الخدمات',
            valueEn: 'Services',
            updatedAt: currentTimestamp,
        },
        {
            section: 'footer',
            key: 'about_link',
            valueAr: 'عن الدكتورة',
            valueEn: 'About Doctor',
            updatedAt: currentTimestamp,
        },
        {
            section: 'footer',
            key: 'copyright',
            valueAr: '© 2024 د. نورا أحمد. جميع الحقوق محفوظة.',
            valueEn: '© 2024 Dr. Noura Ahmed. All rights reserved.',
            updatedAt: currentTimestamp,
        },
    ];

    await db.insert(siteContent).values(sampleSiteContent);
    
    console.log('✅ Site content seeder completed successfully - 25 records inserted');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});