import { db } from '@/db';
import { testimonials } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleTestimonials = [
        {
            nameAr: 'أحمد محمد',
            nameEn: 'Ahmed Mohamed',
            textAr: 'دكتورة نورا محترفة جداً وصبورة. ساعدتني في خسارة 15 كيلو في 3 شهور بطريقة صحية. النظام الغذائي كان سهل ومش حاسس إني محروم من أي حاجة. شكراً دكتورة!',
            textEn: 'Dr. Noura is very professional and patient. She helped me lose 15 kg in 3 months in a healthy way. The diet was easy and I didn\'t feel deprived of anything. Thank you doctor!',
            rating: 5,
            displayOrder: 1,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'فاطمة حسن',
            nameEn: 'Fatima Hassan',
            textAr: 'بعد الولادة كنت محتاجة أرجع لوزني الطبيعي. دكتورة نورا وضعت لي برنامج مخصص ومناسب لفترة الرضاعة. النتيجة كانت رائعة والمتابعة ممتازة.',
            textEn: 'After giving birth, I needed to return to my normal weight. Dr. Noura created a customized program suitable for breastfeeding. The results were amazing and the follow-up was excellent.',
            rating: 5,
            displayOrder: 2,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'محمود علي',
            nameEn: 'Mahmoud Ali',
            textAr: 'كنت أعاني من السكري والكوليسترول. دكتورة نورا ساعدتني في تنظيم السكر والكوليسترول من خلال نظام غذائي صحي. تحسنت صحتي بشكل ملحوظ.',
            textEn: 'I was suffering from diabetes and cholesterol. Dr. Noura helped me regulate my sugar and cholesterol through a healthy diet. My health improved significantly.',
            rating: 5,
            displayOrder: 3,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'مريم خالد',
            nameEn: 'Mariam Khaled',
            textAr: 'الاستشارة الأونلاين كانت مريحة جداً. دكتورة نورا شرحت كل حاجة بالتفصيل والنظام الغذائي كان سهل التطبيق. خسرت 10 كيلو في شهرين.',
            textEn: 'The online consultation was very convenient. Dr. Noura explained everything in detail and the diet was easy to follow. I lost 10 kg in two months.',
            rating: 5,
            displayOrder: 4,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'عمر إبراهيم',
            nameEn: 'Omar Ibrahim',
            textAr: 'كرياضي محتاج نظام غذائي خاص. دكتورة نورا وضعت لي برنامج متكامل لزيادة العضلات وتحسين الأداء. النتائج فاقت التوقعات.',
            textEn: 'As an athlete, I needed a special diet. Dr. Noura created a complete program to increase muscle and improve performance. The results exceeded expectations.',
            rating: 5,
            displayOrder: 5,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'نورهان سعيد',
            nameEn: 'Nourhan Saeed',
            textAr: 'بعد عملية التكميم كنت محتاجة متابعة دقيقة. دكتورة نورا كانت داعمة جداً وساعدتني في الوصول للوزن المثالي بأمان تام.',
            textEn: 'After sleeve surgery, I needed precise follow-up. Dr. Noura was very supportive and helped me reach my ideal weight safely.',
            rating: 5,
            displayOrder: 6,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'كريم أحمد',
            nameEn: 'Karim Ahmed',
            textAr: 'المتابعة الدورية والدعم المستمر من دكتورة نورا كان له أثر كبير في نجاحي. خسرت 20 كيلو وحافظت على الوزن لأكثر من سنة.',
            textEn: 'The regular follow-up and continuous support from Dr. Noura had a great impact on my success. I lost 20 kg and maintained the weight for over a year.',
            rating: 5,
            displayOrder: 7,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            nameAr: 'سارة محمود',
            nameEn: 'Sara Mahmoud',
            textAr: 'تجربتي مع دكتورة نورا كانت ممتازة من أول يوم. النظام الغذائي متنوع ولذيذ والنتائج سريعة. أنصح الجميع بالمتابعة معها.',
            textEn: 'My experience with Dr. Noura was excellent from day one. The diet is varied and delicious, and the results are fast. I recommend everyone to follow up with her.',
            rating: 5,
            displayOrder: 8,
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    await db.insert(testimonials).values(sampleTestimonials);
    
    console.log('✅ Testimonials seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});