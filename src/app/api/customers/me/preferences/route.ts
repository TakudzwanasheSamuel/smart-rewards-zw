import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserIdFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    console.log('🔑 User ID from token:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interests } = await req.json();
    console.log('📝 Interests to update:', interests);

    if (!interests) {
      return NextResponse.json({ error: 'Missing interests field' }, { status: 400 });
    }

    // First check if customer record exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { user_id: userId }
    });
    
    console.log('👤 Existing customer found:', !!existingCustomer);

    if (!existingCustomer) {
      console.log('❌ No customer record found for user ID:', userId);
      
      // Try to create the customer record if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      if (user.user_type !== 'customer') {
        return NextResponse.json({ error: 'User is not a customer' }, { status: 400 });
      }
      
      console.log('🔧 Creating missing customer record...');
      const newCustomer = await prisma.customer.create({
        data: {
          user_id: userId,
          full_name: '', // Will need to be updated later
          interests,
        },
      });
      
      console.log('✅ Customer record created and preferences updated');
      return NextResponse.json(newCustomer);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { user_id: userId },
      data: { interests },
    });

    console.log('✅ Customer preferences updated successfully');
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('❌ Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
