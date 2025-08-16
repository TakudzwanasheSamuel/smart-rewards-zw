import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { processReceipt } from '@/ai/flows/process-receipt';

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

    const { qrCodeData, businessId, transactionAmount } = await req.json();

    // Call the processReceipt Genkit flow for receipt uploads
    if (qrCodeData) {
      const receiptResult = await processReceipt({ receiptImage: qrCodeData });
      if (!receiptResult.isVerified) {
        return NextResponse.json({ error: 'Receipt verification failed', details: receiptResult.verificationNotes }, { status: 400 });
      }
    }


    const loyaltyRule = await prisma.loyaltyRule.findFirst({
      where: { business_id: businessId, rule_type: 'points' },
    });

    let pointsEarned = 0;
    if (loyaltyRule) {
      // This is a simplified points calculation. A real implementation would be more complex.
      const rule = loyaltyRule.rule_json as any;
      pointsEarned = Math.floor(transactionAmount / rule.amount) * rule.points;
    }

    await prisma.transaction.create({
      data: {
        customer_id: userId,
        business_id: businessId,
        transaction_amount: transactionAmount,
        points_earned: pointsEarned,
      },
    });

    await prisma.customer.update({
      where: { user_id: userId },
      data: {
        loyalty_points: {
          increment: pointsEarned,
        },
      },
    });

    return NextResponse.json({ message: 'Scan successful', pointsEarned });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
