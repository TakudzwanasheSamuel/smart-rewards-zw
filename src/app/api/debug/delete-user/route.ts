import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('🗑️ Deleting user and all related records for:', userId);
    
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        business: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('👤 Found user:', user.email, 'Type:', user.user_type);

    // Delete related records first due to foreign key constraints
    if (user.customer) {
      console.log('🗑️ Deleting customer transactions...');
      await prisma.transaction.deleteMany({
        where: { customer_id: user.id }
      });
      
      console.log('🗑️ Deleting customer relations...');
      await prisma.customerBusinessRelation.deleteMany({
        where: { customer_id: user.id }
      });
    }

    if (user.business) {
      console.log('🗑️ Deleting business transactions...');
      await prisma.transaction.deleteMany({
        where: { business_id: user.id }
      });
      
      console.log('🗑️ Deleting business relations...');
      await prisma.customerBusinessRelation.deleteMany({
        where: { business_id: user.id }
      });
      
      console.log('🗑️ Deleting business offers...');
      await prisma.offer.deleteMany({
        where: { business_id: user.id }
      });
      
      console.log('🗑️ Deleting business loyalty rules...');
      await prisma.loyaltyRule.deleteMany({
        where: { business_id: user.id }
      });
    }

    // Now delete the user (this will cascade delete customer/business profiles)
    console.log('🗑️ Deleting user record...');
    await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log('✅ User deleted successfully');
    
    return NextResponse.json({ 
      message: 'User deleted successfully',
      deleted_user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
