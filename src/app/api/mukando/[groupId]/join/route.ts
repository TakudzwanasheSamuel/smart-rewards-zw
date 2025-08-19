import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { awardPoints, POINTS_REWARDS } from '@/lib/points';

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    console.log(`👥 Customer ${userId} joining mukando group ${groupId}`);

    // Check if the group exists
    const mukandoGroup = await prisma.mukandoGroup.findUnique({
      where: { id: groupId },
      include: {
        business: {
          select: {
            business_name: true
          }
        }
      }
    });

    if (!mukandoGroup) {
      return NextResponse.json({ error: 'Mukando group not found' }, { status: 404 });
    }

    // Check if customer is already in the group
    const existingContribution = await prisma.mukandoContribution.findFirst({
      where: {
        group_id: groupId,
        customer_id: userId,
      },
    });

    if (existingContribution) {
      console.log('⚠️ Customer already in this mukando group');
      return NextResponse.json({ message: 'Already joined this mukando group' });
    }

    // Add customer to the mukando group
    await prisma.mukandoContribution.create({
      data: {
        group_id: groupId,
        customer_id: userId,
        amount: 0, // Initial contribution
      },
    });

    // Award points for joining mukando group
    const pointsResult = await awardPoints({
      customerId: userId,
      businessId: mukandoGroup.business_id,
      points: POINTS_REWARDS.JOIN_MUKANDO.points,
      activity: POINTS_REWARDS.JOIN_MUKANDO.activity,
      description: POINTS_REWARDS.JOIN_MUKANDO.description
    });

    console.log('✅ Customer joined mukando group successfully');
    return NextResponse.json({ 
      message: 'Joined mukando group successfully',
      groupName: mukandoGroup.group_name,
      businessName: mukandoGroup.business.business_name,
      pointsAwarded: pointsResult.pointsAwarded,
      newTotal: pointsResult.newTotal
    });
  } catch (error) {
    console.error('Join mukando group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
