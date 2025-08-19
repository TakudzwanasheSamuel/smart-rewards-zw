import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

// Loyalty points calculation: 10% of points contributed
const LOYALTY_POINTS_RATE = 0.1;

export async function POST(req: NextRequest) {
  try {
    const { mukandoGroupId, pointsAmount } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const customerId = decoded.userId;

    console.log('💰 Mukando contribution:', {
      mukandoGroupId,
      customerId,
      pointsAmount
    });

    // Validate required fields
    if (!mukandoGroupId || !pointsAmount || pointsAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid mukandoGroupId or pointsAmount' 
      }, { status: 400 });
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Find the customer
      const customer = await tx.customer.findUnique({
        where: { user_id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if customer has sufficient points
      if (customer.loyalty_points < pointsAmount) {
        throw new Error('Insufficient loyalty points');
      }

      // Find the Mukando group
      const mukandoGroup = await tx.mukandoGroup.findUnique({
        where: { id: mukandoGroupId },
        include: {
          members: true,
          business: {
            select: {
              business_name: true
            }
          }
        }
      });

      if (!mukandoGroup) {
        throw new Error('Mukando group not found');
      }

      if (mukandoGroup.status !== 'approved') {
        throw new Error('Group is not approved');
      }

      // Check if customer is a member
      const membership = mukandoGroup.members.find(m => m.customer_id === customerId);
      if (!membership) {
        throw new Error('You are not a member of this group');
      }

      // Calculate loyalty points earned (10% of contributed points)
      const loyaltyPointsEarned = Math.floor(pointsAmount * LOYALTY_POINTS_RATE);

      // Deduct points from customer
      const updatedCustomer = await tx.customer.update({
        where: { user_id: customerId },
        data: {
          loyalty_points: {
            decrement: pointsAmount
          }
        }
      });

      // Update Mukando group totals
      const updatedGroup = await tx.mukandoGroup.update({
        where: { id: mukandoGroupId },
        data: {
          total_mukando_points: {
            increment: pointsAmount
          },
          total_loyalty_points_earned: {
            increment: loyaltyPointsEarned
          }
        }
      });

      // Update member's contribution total
      await tx.mukandoMember.update({
        where: {
          id: membership.id
        },
        data: {
          points_contributed: {
            increment: pointsAmount
          }
        }
      });

      // Create contribution record
      const contribution = await tx.mukandoContribution.create({
        data: {
          group_id: mukandoGroupId,
          customer_id: customerId,
          points_amount: pointsAmount,
          loyalty_points_awarded: loyaltyPointsEarned
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          customer_id: customerId,
          business_id: mukandoGroup.business_id,
          transaction_type: 'mukando_contribution',
          points_deducted: pointsAmount,
          mukando_group_id: mukandoGroupId,
          is_mukando_contribution: true,
          loyalty_points_awarded: loyaltyPointsEarned
        }
      });

      return {
        contribution,
        updatedGroup,
        remainingPoints: updatedCustomer.loyalty_points,
        loyaltyPointsEarned
      };
    });

    console.log('✅ Mukando contribution successful:', {
      groupId: mukandoGroupId,
      customerId,
      pointsContributed: pointsAmount,
      loyaltyPointsEarned: result.loyaltyPointsEarned
    });

    return NextResponse.json({
      message: 'Contribution successful',
      contribution: result.contribution,
      groupProgress: {
        totalMukandoPoints: result.updatedGroup.total_mukando_points,
        goalPointsRequired: result.updatedGroup.goal_points_required,
        progressPercentage: Math.round((result.updatedGroup.total_mukando_points / result.updatedGroup.goal_points_required) * 100)
      },
      customerStatus: {
        remainingPoints: result.remainingPoints,
        loyaltyPointsEarned: result.loyaltyPointsEarned
      }
    });

  } catch (error) {
    console.error('❌ Mukando contribution error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Insufficient loyalty points') {
        return NextResponse.json({ error: 'Insufficient loyalty points' }, { status: 400 });
      }
      if (error.message === 'Customer not found') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      if (error.message === 'Mukando group not found') {
        return NextResponse.json({ error: 'Mukando group not found' }, { status: 404 });
      }
      if (error.message === 'Group is not approved') {
        return NextResponse.json({ error: 'Group is not approved' }, { status: 400 });
      }
      if (error.message === 'You are not a member of this group') {
        return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
