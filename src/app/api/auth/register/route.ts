import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, user_type, full_name, business_name, business_category } = await req.json();

    if (!email || !password || !user_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        user_type,
      },
    });

    if (user_type === 'customer') {
      await prisma.customer.create({
        data: {
          user_id: user.id,
          full_name,
        },
      });
    } else if (user_type === 'business') {
      await prisma.business.create({
        data: {
          user_id: user.id,
          business_name,
          business_category,
        },
      });
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
