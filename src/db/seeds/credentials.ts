import { db } from '@/db';
import { credentials } from '@/db/schema';

async function main() {
    const sampleCredentials = [
        {
            titleAr: 'ماجستير تغذية صحية',
            titleEn: "Master's in Clinical Nutrition",
            institutionAr: 'جامعة القاهرة',
            institutionEn: 'Cairo University',
            displayOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'دبلومة تغذية صحية',
            titleEn: 'Diploma in Clinical Nutrition',
            institutionAr: 'نقابة الزراعيين',
            institutionEn: 'Agricultural Syndicate',
            displayOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'بكالوريوس علوم وتكنولوجيا الأغذية والتغذية',
            titleEn: "Bachelor's in Food Science, Technology and Nutrition",
            institutionAr: 'كلية زراعة - جامعة عين شمس',
            institutionEn: 'Faculty of Agriculture - Ain Shams University',
            displayOrder: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            titleAr: 'شهادة إعداد القادة',
            titleEn: 'Leadership Preparation Certificate',
            institutionAr: 'معهد إعداد القادة بحلوان',
            institutionEn: 'Leadership Preparation Institute - Helwan',
            displayOrder: 4,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(credentials).values(sampleCredentials);
    
    console.log('✅ Credentials seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});