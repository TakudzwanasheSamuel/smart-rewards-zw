import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const {
      businessId,
      goalName,
      goalPointsRequired,
      contributionInterval,
      termLength
    } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const customerId = decoded.userId;

    console.log('🏦 Creating Mukando group request:', {
      customerId,
      businessId,
      goalName,
      goalPointsRequired,
      contributionInterval,
      termLength
    });

    // Validate required fields
    if (!businessId || !goalName || !goalPointsRequired || !contributionInterval || !termLength) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate that business exists
    const business = await prisma.business.findUnique({
      where: { user_id: businessId }
    });

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found' 
      }, { status: 404 });
    }

    // Validate that customer exists
    const customer = await prisma.customer.findUnique({
      where: { user_id: customerId }
    });

    if (!customer) {
      return NextResponse.json({ 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    // Create Mukando group request
    const mukandoGroup = await prisma.mukandoGroup.create({
      data: {
        creator_id: customerId,
        business_id: businessId,
        goal_name: goalName,
        goal_points_required: goalPointsRequired,
        contribution_interval: contributionInterval,
        term_length: termLength,
        status: 'pending_approval'
      },
      include: {
        creator: {
          select: {
            user_id: true,
            full_name: true
          }
        },
        business: {
          select: {
            user_id: true,
            business_name: true
          }
        }
      }
    });

    console.log('✅ Mukando group request created successfully:', mukandoGroup.id);

    return NextResponse.json({
      message: 'Mukando group request created successfully',
      group: mukandoGroup
    });

  } catch (error) {
    console.error('❌ Create Mukando group request error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
