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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = params;

    await prisma.customerBusinessRelation.create({
      data: {
        customer_id: userId,
        business_id: businessId,
      },
    });

    return NextResponse.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = params;

    await prisma.customerBusinessRelation.delete({
      where: {
        customer_id_business_id: {
          customer_id: userId,
          business_id: businessId,
        },
      },
    });

    return NextResponse.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
