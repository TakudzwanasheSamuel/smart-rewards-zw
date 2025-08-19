import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { awardSignupPoints } from '@/lib/points';

export async function POST(req: NextRequest) {
  try {
    const { email, password, user_type, full_name, business_name, business_category } = await req.json();
    
    console.log('🚀 Registration attempt:', { email, user_type, full_name, business_name });

    if (!email || !password || !user_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating user record...');
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        user_type,
      },
    });

    console.log('✅ User created with ID:', user.id);

    if (user_type === 'customer') {
      console.log('👨‍💼 Creating customer record...');
      const customer = await prisma.customer.create({
        data: {
          user_id: user.id,
          full_name: full_name || '',
          loyalty_points: 0, // Will be updated by awardPoints
          eco_points: 0,
          loyalty_tier: 'Bronze',
        },
      });
      console.log('✅ Customer record created:', customer.id);

      // Award signup bonus points
      await awardSignupPoints(user.id);
    } else if (user_type === 'business') {
      console.log('🏢 Creating business record...');
      const business = await prisma.business.create({
        data: {
          user_id: user.id,
          business_name: business_name || '',
          business_category: business_category || '',
        },
      });
      console.log('✅ Business record created:', business.id);
    }

    console.log('🎉 Registration completed successfully');
    
    // Generate JWT token for automatic login
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
