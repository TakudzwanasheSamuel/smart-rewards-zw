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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;

    const relation = await prisma.customerBusinessRelation.findUnique({
      where: {
        customer_id_business_id: {
          customer_id: userId,
          business_id: businessId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!relation });
  } catch (error) {
    console.error('Check follow status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;
    console.log(`👤➕ Customer ${userId} following business ${businessId}`);

    // Check if already following
    const existingRelation = await prisma.customerBusinessRelation.findUnique({
      where: {
        customer_id_business_id: {
          customer_id: userId,
          business_id: businessId,
        },
      },
    });

    if (existingRelation) {
      console.log('⚠️ Customer already following this business');
      return NextResponse.json({ message: 'Already following this business' });
    }

    await prisma.customerBusinessRelation.create({
      data: {
        customer_id: userId,
        business_id: businessId,
      },
    });

    // Award points for following a business
    const pointsResult = await awardPoints({
      customerId: userId,
      businessId: businessId,
      points: POINTS_REWARDS.FOLLOW_BUSINESS.points,
      activity: POINTS_REWARDS.FOLLOW_BUSINESS.activity,
      description: POINTS_REWARDS.FOLLOW_BUSINESS.description
    });

    console.log('✅ Follow relationship created successfully');
    return NextResponse.json({ 
      message: 'Followed successfully', 
      pointsAwarded: pointsResult.pointsAwarded,
      newTotal: pointsResult.newTotal
    });
  } catch (error) {
    console.error('Follow business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: businessId } = await params;
    console.log(`👤➖ Customer ${userId} unfollowing business ${businessId}`);

    // Check if relationship exists
    const existingRelation = await prisma.customerBusinessRelation.findUnique({
      where: {
        customer_id_business_id: {
          customer_id: userId,
          business_id: businessId,
        },
      },
    });

    if (!existingRelation) {
      console.log('⚠️ Customer was not following this business');
      return NextResponse.json({ message: 'Not following this business' });
    }

    await prisma.customerBusinessRelation.delete({
      where: {
        customer_id_business_id: {
          customer_id: userId,
          business_id: businessId,
        },
      },
    });

    console.log('✅ Follow relationship removed successfully');
    return NextResponse.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
