import { db } from '@/db';
import { user, account, staff } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const currentTimestamp = new Date();
    
    // Generate unique IDs
    const superAdminUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doctorAdminUserId = `user_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
    
    const superAdminAccountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doctorAdminAccountId = `account_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Hash passwords
    const superAdminHashedPassword = await bcrypt.hash('Dmg159753@#', 10);
    const doctorAdminHashedPassword = await bcrypt.hash('Noura159753@#', 10);
    
    // Prepare user records
    const userRecords = [
        {
            id: superAdminUserId,
            name: 'Mohamed Tash',
            email: 'mohamedtash574@gmail.com',
            emailVerified: true,
            role: 'admin',
            passwordNeedsChange: false,
            image: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: doctorAdminUserId,
            name: 'Dr. Noura Ahmed',
            email: 'Dr.nouraahmed1@gmail.com',
            emailVerified: true,
            role: 'doctor',
            passwordNeedsChange: false,
            image: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];
    
    // Prepare account records
    const accountRecords = [
        {
            id: superAdminAccountId,
            accountId: 'mohamedtash574@gmail.com',
            providerId: 'credential',
            userId: superAdminUserId,
            password: superAdminHashedPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: doctorAdminAccountId,
            accountId: 'Dr.nouraahmed1@gmail.com',
            providerId: 'credential',
            userId: doctorAdminUserId,
            password: doctorAdminHashedPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];
    
    // Prepare staff records
    const staffRecords = [
        {
            userId: superAdminUserId,
            fullName: 'Mohamed Tash',
            role: 'admin',
            status: 'active',
            permissions: JSON.stringify([
                "manage_patients",
                "manage_staff",
                "manage_diet_plans",
                "manage_appointments",
                "view_analytics",
                "manage_cms",
                "full_access"
            ]),
            phone: null,
            createdAt: currentTimestamp.toISOString(),
            updatedAt: currentTimestamp.toISOString(),
        },
        {
            userId: doctorAdminUserId,
            fullName: 'Dr. Noura Ahmed',
            role: 'doctor',
            status: 'active',
            permissions: JSON.stringify([
                "manage_patients",
                "manage_staff",
                "manage_diet_plans",
                "manage_appointments",
                "view_analytics",
                "manage_cms",
                "full_access"
            ]),
            phone: null,
            createdAt: currentTimestamp.toISOString(),
            updatedAt: currentTimestamp.toISOString(),
        }
    ];
    
    // Insert users
    await db.insert(user).values(userRecords);
    
    // Insert accounts
    await db.insert(account).values(accountRecords);
    
    // Insert staff
    await db.insert(staff).values(staffRecords);
    
    console.log('✅ Admin accounts seeder completed successfully');
    console.log('📧 Super Admin: mohamedtash574@gmail.com');
    console.log('📧 Doctor Admin: Dr.nouraahmed1@gmail.com');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});