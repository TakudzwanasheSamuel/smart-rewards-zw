import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { formatPointsAsCurrency } from '@/lib/currency';
import { prisma } from '@/lib/db/prisma';

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
    console.log('🔑 Getting transactions for user ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer to ensure they exist
    const customer = await prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get all transactions for this customer
    const transactions = await prisma.transaction.findMany({
      where: { customer_id: userId },
      include: {
        business: {
          select: {
            business_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50, // Limit to last 50 transactions
    });

    console.log('📊 Found', transactions.length, 'transactions');

    // Transform the data for frontend consumption
    const formattedTransactions = transactions.map(tx => {
      const isEarn = tx.transaction_type !== 'redemption' && (tx.points_earned && tx.points_earned > 0);
      const isRedemption = tx.transaction_type === 'redemption' || (tx.points_deducted && tx.points_deducted > 0);
      
      let description = '';
      let amount = '';
      let type = 'earn';
      
      if (isRedemption) {
        type = 'redeem';
        const pointsUsed = tx.points_deducted || 0;
        description = `Offer redeemed at ${tx.business?.business_name || 'Unknown Business'}`;
        amount = `-${pointsUsed} pts`;
      } else if (tx.transaction_type === 'mukando_contribution') {
        description = `Mukando contribution at ${tx.business?.business_name || 'Unknown Business'}`;
        amount = `+${tx.points_earned || 0} pts (${formatPointsAsCurrency(tx.points_earned || 0)})`;
      } else {
        // Regular points earned
        description = tx.business?.business_name 
          ? `Points earned at ${tx.business.business_name}` 
          : 'Welcome bonus points';
        amount = `+${tx.points_earned || 0} pts (${formatPointsAsCurrency(tx.points_earned || 0)})`;
      }
      
      return {
        id: tx.id,
        type,
        description,
        amount,
        points: tx.points_earned || -(tx.points_deducted || 0),
        date: tx.created_at.toISOString().split('T')[0],
        businessName: tx.business?.business_name,
      };
    });

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
