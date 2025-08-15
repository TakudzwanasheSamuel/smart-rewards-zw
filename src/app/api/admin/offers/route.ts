import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getBusinessIdFromToken(req: NextRequest) {
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

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const newOffer = await prisma.offer.create({
      data: {
        ...body,
        business_id: businessId,
      },
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
