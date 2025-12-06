import { db } from '@/db';
import { expertiseAreas } from '@/db/schema';

async function main() {
    const sampleExpertiseAreas = [
        {
            titleAr: 'تغذية رياضية',
            titleEn: 'Sports Nutrition',
            descriptionAr: 'برامج غذائية متخصصة للرياضيين والأشخاص النشطين لتحسين الأداء وبناء العضلات',
            descriptionEn: 'Specialized nutrition programs for athletes and active individuals to improve performance and build muscle',
            icon: 'dumbbell',
            displayOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'تغذية الطفل والطفل الرياضي والمسنين',
            titleEn: 'Child, Athletic Child, and Elderly Nutrition',
            descriptionAr: 'برامج غذائية مصممة خصيصاً للأطفال والمراهقين وكبار السن لضمان نمو صحي وحياة أفضل',
            descriptionEn: 'Nutrition programs specifically designed for children, adolescents, and seniors to ensure healthy growth and better life',
            icon: 'users',
            displayOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'متابعة حالات السمنة وما بعد جراحات السمنة',
            titleEn: 'Obesity Management and Post-Bariatric Surgery Follow-up',
            descriptionAr: 'متابعة شاملة لحالات السمنة مع خطط غذائية متخصصة للتعافي بعد جراحات السمنة',
            descriptionEn: 'Comprehensive follow-up for obesity cases with specialized nutrition plans for recovery after bariatric surgery',
            icon: 'scale',
            displayOrder: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'عيادة تغذية علاجية - خبرة عملية',
            titleEn: 'Clinical Nutrition Practice - Practical Experience',
            descriptionAr: 'خبرة عملية واسعة في علاج الحالات الطبية المختلفة من خلال التغذية العلاجية المتخصصة',
            descriptionEn: 'Extensive practical experience in treating various medical conditions through specialized clinical nutrition',
            icon: 'stethoscope',
            displayOrder: 4,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'تغذية علاجية للأمراض المزمنة',
            titleEn: 'Therapeutic Nutrition for Chronic Diseases',
            descriptionAr: 'برامج غذائية علاجية لإدارة الأمراض المزمنة مثل السكري وضغط الدم والكوليسترول',
            descriptionEn: 'Therapeutic nutrition programs for managing chronic diseases such as diabetes, hypertension, and cholesterol',
            icon: 'heartbeat',
            displayOrder: 5,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'متابعة أونلاين',
            titleEn: 'Online Follow-up',
            descriptionAr: 'استشارات ومتابعة غذائية عن بعد لتوفير الراحة والمرونة في تحقيق أهدافك الصحية',
            descriptionEn: 'Remote nutrition consultations and follow-up to provide convenience and flexibility in achieving your health goals',
            icon: 'laptop',
            displayOrder: 6,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'أجهزة التخسيس وتقنية الميزوثيرابي',
            titleEn: 'Slimming Devices and Mesotherapy Technology',
            descriptionAr: 'استخدام أحدث أجهزة التخسيس وتقنية الميزوثيرابي لنتائج أفضل وأسرع',
            descriptionEn: 'Using the latest slimming devices and mesotherapy technology for better and faster results',
            icon: 'zap',
            displayOrder: 7,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(expertiseAreas).values(sampleExpertiseAreas);
    
    console.log('✅ Expertise Areas seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});