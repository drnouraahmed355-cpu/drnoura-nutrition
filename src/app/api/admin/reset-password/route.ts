import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, staff } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { secret, email, password, action } = await request.json();

    if (secret !== process.env.BETTER_AUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase();

    if (action === 'create_admin') {
      const existingUser = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
      
      if (existingUser.length > 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.update(account)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(account.userId, existingUser[0].id));
        
        return NextResponse.json({ 
          success: true, 
          message: 'Password updated',
          email: normalizedEmail 
        });
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.insert(user).values({
        id: userId,
        name: 'Admin',
        email: normalizedEmail,
        emailVerified: true,
        role: 'admin',
        passwordNeedsChange: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(account).values({
        id: accountId,
        accountId: normalizedEmail,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(staff).values({
        userId: userId,
        fullName: 'Admin',
        role: 'admin',
        status: 'active',
        permissions: JSON.stringify(['full_access']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Admin created',
        email: normalizedEmail
      });
    }

    if (action === 'reset') {
      const existingUser = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
      
      if (existingUser.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.update(account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(account.userId, existingUser[0].id));

      return NextResponse.json({ 
        success: true, 
        message: 'Password reset',
        email: normalizedEmail 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
