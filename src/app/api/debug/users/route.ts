import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug: Fetching all users and their profiles...');
    
    const users = await prisma.user.findMany({
      include: {
        customer: true,
        business: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const userSummary = users.map(user => ({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      created_at: user.created_at,
      has_customer_profile: !!user.customer,
      has_business_profile: !!user.business,
      customer_id: user.customer?.id || null,
      business_id: user.business?.id || null,
      customer_points: user.customer?.loyalty_points || null,
      customer_tier: user.customer?.loyalty_tier || null,
      customer_name: user.customer?.full_name || null,
      business_name: user.business?.business_name || null,
    }));

    console.log('📊 Found', users.length, 'users in database');
    
    return NextResponse.json({
      total_users: users.length,
      users: userSummary,
    });
  } catch (error) {
    console.error('❌ Debug users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
