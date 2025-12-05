import { db } from '@/db';
import { user, staff } from '@/db/schema';

async function main() {
    const currentDate = new Date().toISOString();
    
    // First, create user accounts for staff members
    const staffUsers = [
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r1',
            name: 'Dr. Noura Ahmed',
            email: 'dr.noura@nutricare.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r2',
            name: 'Sarah Mohammed',
            email: 'sarah.m@nutricare.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r3',
            name: 'Ahmed Hassan',
            email: 'ahmed.h@nutricare.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            name: 'Fatima Ali',
            email: 'fatima.a@nutricare.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            name: 'Layla Ibrahim',
            email: 'layla.i@nutricare.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
    ];

    await db.insert(user).values(staffUsers);

    // Then create staff records
    const staffMembers = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r1',
            fullName: 'Dr. Noura Ahmed',
            role: 'doctor',
            permissions: JSON.stringify([
                'manage_patients',
                'manage_staff',
                'manage_diet_plans',
                'manage_appointments',
                'view_analytics'
            ]),
            phone: '+201012345678',
            status: 'active',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r2',
            fullName: 'Sarah Mohammed',
            role: 'nutritionist',
            permissions: JSON.stringify([
                'manage_patients',
                'manage_diet_plans',
                'manage_appointments',
                'view_analytics'
            ]),
            phone: '+201098765432',
            status: 'active',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r3',
            fullName: 'Ahmed Hassan',
            role: 'assistant',
            permissions: JSON.stringify([
                'manage_appointments',
                'view_patients'
            ]),
            phone: '+201123456789',
            status: 'active',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            fullName: 'Fatima Ali',
            role: 'nutritionist',
            permissions: JSON.stringify([
                'manage_patients',
                'manage_diet_plans',
                'manage_appointments',
                'view_analytics'
            ]),
            phone: '+201187654321',
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            fullName: 'Layla Ibrahim',
            role: 'assistant',
            permissions: JSON.stringify([
                'manage_appointments',
                'view_patients'
            ]),
            phone: '+201156789012',
            status: 'active',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
    ];

    await db.insert(staff).values(staffMembers);

    console.log('✅ Staff seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});