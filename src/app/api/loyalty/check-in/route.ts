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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId, coordinates } = await req.json();

    // TODO: Call verifyLocation Genkit flow

    const pointsToAward = 10; // Example points for check-in

    await prisma.transaction.create({
      data: {
        customer_id: userId,
        business_id: businessId,
        points_earned: pointsToAward,
        transaction_amount: 0,
      },
    });

    await prisma.customer.update({
      where: { user_id: userId },
      data: {
        loyalty_points: {
          increment: pointsToAward,
        },
      },
    });

    return NextResponse.json({ message: 'Check-in successful', pointsAwarded: pointsToAward });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
