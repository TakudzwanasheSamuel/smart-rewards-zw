import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    console.log('🔑 Getting customer profile for user ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user still exists (in case of stale tokens after database reset)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('❌ User not found in database - likely stale token after reset');
      return NextResponse.json({ 
        error: 'User account not found. Please log out and log back in.',
        code: 'STALE_TOKEN'
      }, { status: 401 });
    }

    let customer = await prisma.customer.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            email: true,
            created_at: true
          }
        }
      }
    });

    if (!customer) {
      console.log('❌ No customer record found, checking if user exists...');
      
      // Check if user exists and is a customer
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      if (user.user_type !== 'customer') {
        return NextResponse.json({ error: 'User is not a customer' }, { status: 400 });
      }
      
      // Create missing customer record
      console.log('🔧 Creating missing customer record...');
      customer = await prisma.customer.create({
        data: {
          user_id: userId,
          full_name: '',
          loyalty_points: 0,
          eco_points: 0,
          loyalty_tier: 'Bronze',
        },
        include: {
          user: {
            select: {
              email: true,
              created_at: true
            }
          }
        }
      });
      
      console.log('✅ Customer record created:', customer.id);
    }

    console.log('📊 Returning customer profile');
    return NextResponse.json(customer);
  } catch (error) {
    console.error('❌ Get customer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
